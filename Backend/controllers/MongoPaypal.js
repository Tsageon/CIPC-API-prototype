const Company = require('../models/Company');  
const paypalClient = require('../config/Paypal');
const paypal = require('@paypal/checkout-server-sdk');
const express = require('express');
const router = express.Router();
require('dotenv').config();

router.get('/sub-status/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const company = await Company.findById(id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const currentDate = moment();
        const nextDueDate = moment(company.subscription.next_payment_due);
        const daysUntilDue = nextDueDate.diff(currentDate, 'days');

        console.log(`🔍 Days Until Due: ${daysUntilDue}`);

        if (company.subscription.status === 'inactive') {
            return res.status(200).json({ message: 'Subscription is inactive' });
        }

        if (company.subscription.status === 'active' && nextDueDate.isBefore(currentDate)) {
            return res.status(200).json({ message: 'Subscription is due for renewal' });
        }

        if (company.subscription.status === 'active' && daysUntilDue <= 7 && daysUntilDue > 0) {
            console.log(`📩 Sending email to ${company.email}...`);

            const subject = 'Subscription Renewal Reminder';
            const text = `Hi ${company.companyName},\n\nYour subscription is about to expire in ${daysUntilDue} days. Please renew it to avoid any interruptions.\n\nBest regards,\nDeez`;
            const html = `<p>Hi ${company.companyName},</p><p>Your subscription is about to expire in ${daysUntilDue} days. Please renew it to avoid any interruptions.</p><p>Best regards,<br>Nuts</p>`;

            const emailSent = await sendEmail(company.email, subject, text, html);
            if (emailSent) {
                console.log(`📧 Reminder email sent to ${company.companyName}`);
            } else {
                console.error(`❌ Failed to send reminder email to ${company.companyName}`);
            }
        } else {
            console.log(`📆 No email sent. Subscription is valid for ${daysUntilDue} more days.`);
        }

        res.status(200).json({
            message: 'Subscription is active and valid',
            subscription: company.subscription
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving company subscription status' });
    }
});

router.post('/make-payment/:id', async (req, res) => {
    const { id } = req.params;
    const { sub, enterprise_number } = req.body; 

    let company;

    try {
        if (id) {
            company = await Company.findById(id);
        }

        if (!company && enterprise_number) {
            company = await Company.findOne({ enterprise_number });
        }

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const availableSubs = ['basic', 'professional', 'enterprise'];
        if (!availableSubs.includes(sub.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid subscription plan' });
        }
        
        const amount = sub === 'basic' ? 499  
            : sub === 'professional' ? 999
            : 2499;

        const request = new paypal.orders.OrdersCreateRequest();
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: amount,
                    },
                    description: `${sub.charAt(0).toUpperCase() + sub.slice(1)} Plan Subscription for ${company.companyName}`,  // 'sub' instead of 'tier'
                }
            ],
            application_context: {
                return_url: `${process.env.HOSTED_URL}/api/companies/pay/approve`,
                cancel_url: `${process.env.HOSTED_URL}/api/companies/pay/back`,
            }
        });

        const order = await paypalClient.execute(request);
        const approvalUrl = order.result.links.find(link => link.rel === 'approve').href;

        company.subscription.plan = sub;  
        company.subscription.status = 'active'; 
        await company.save();

        res.status(200).json({
            id: order.result.id,
            approval_url: approvalUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating PayPal order' });
    }
});

router.post('/save-payment/:id', async (req, res) => {
    const { id } = req.params;
    const { orderID } = req.body;

    try {
        const company = await Company.findById(id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});

        const capture = await paypalClient.execute(request);

        if (capture.result.status === 'COMPLETED') {
            company.subscription.isActive = true;
            company.subscription.last_payment_date = moment().format('YYYY-MM-DD');
            
            company.subscription.next_payment_due = moment(company.subscription.next_payment_due)
                .add(1, 'months')
                .format('YYYY-MM-DD');

            company.subscription.transaction_id = capture.result.id;

            await company.save();

            console.log('Captured PayPal payment:', capture.result);

            res.status(200).json({
                message: 'Payment captured successfully',
                captureDetails: capture.result,
                company
            });
        } else {
            res.status(400).json({ message: 'Payment was not completed' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error capturing PayPal order' });
    }
});


router.get('/approve', async (req, res) => {
    console.log('Query parameters:', req.query);

    let { orderID, token } = req.query;

    if (!orderID && token) {
        orderID = token;
    }

    if (!orderID) {
        return res.status(400).json({ message: 'Missing OrderID' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await paypalClient.execute(request);

        if (capture.result.status === 'COMPLETED') {
            const company = await Company.findOne({ 'pendingOrderID': orderID });
            if (company) {

                company.subscription = {
                    plan: company.tier, 
                    status: 'active',
                    last_payment_date: moment().format('YYYY-MM-DD'),
                    next_payment_due: moment().add(1, 'months').format('YYYY-MM-DD'),
                };
                company.pendingOrderID = null;  
                await company.save();  
            }

            return res.status(200).json({
                message: 'Payment captured successfully',
                captureDetails: capture.result
            });
        } else {
            return res.status(400).json({ message: 'Payment was not completed' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error capturing PayPal order' });
    }
});

router.get('/back', async (req, res) => {
    const { orderID } = req.query;

    if (!orderID) {
        return res.status(400).json({ message: 'Missing order ID' });
    }

    try {
        const company = await Company.findOne({ 'pendingOrderID': orderID });
        if (company) {
            company.pendingOrderID = null;
            company.subscription.status = 'inactive'; 
            await company.save();
            console.log(`Payment canceled for company: ${company.companyName}`);
        }

        res.status(200).json({
            message: 'Payment was canceled. Please try again.'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error processing cancellation' });
    }
});

module.exports = router