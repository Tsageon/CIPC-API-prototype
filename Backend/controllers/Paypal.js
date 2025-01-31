const express = require('express');
const moment = require('moment');
const router = express.Router();
const {sendEmail} = require('../config/Nodemailer')
const paypalClient = require('../config/Paypal');
const paypal = require('@paypal/checkout-server-sdk');

const companies = [
    {
        id: 1,
        enterprise_number: 'ENT12345',
        enterprise_type_description: 'Private Company',
        sic_description: 'Sole Proprietorship',
        name: 'Sausage Party',
        email: 'mylasjacob18.5@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '345632167',
        subscription: {
            tier: 'Basic',
            isActive: false,
            lastPaymentDate: '2025-01-01',
            nextDueDate: '2025-02-01'
        }
    },
    {
        id: 2,
        enterprise_number: 'ENT67890',
        enterprise_type_description: 'Private Company',
        sic_description: 'Corporation',
        name: 'WHY Code!tm',
        email: 'ayandasontlaba6@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '234567891',
        subscription: {
            tier: 'Basic',
            isActive: false,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-29'
        }
    },
    {
        id: 3,
        enterprise_number: 'ENT11223',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Manufacturing',
        name: 'Cassanova United',
        email: 'khanyajara@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '123456789',
        subscription: {
            tier: 'Professional',
            isActive: true,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-29'
        }
    },
    {
        id: 4,
        enterprise_number: 'ENT45678',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Retail Trade',
        name: 'AAUUUUH',
        email: 'rethabilechomi610@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '987654322',
        subscription: {
            tier: 'Basic',
            isActive: true,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-29'
        }
    },
    {
        id: 5,
        enterprise_number: 'ENT32142',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Retail Trade',
        name: 'BLacKLaBoLe',
        email: 't88segamie@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '487654322',
        subscription: {
            tier: 'Enterprise',
            isActive: true,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-10'
        }
    },
    {
        id: 6,
        enterprise_number: 'ENT32143',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Retail',
        name: 'SparkX',
        email: 'llewellyn.ml.info@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '587654322',
        subscription: {
            tier: 'Basic',
            isActive: true,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-29'
        }
    },
    {
        id: 7,
        enterprise_number: 'ENT32144',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Retail',
        name: 'Inquixix',
        email: 'ytmotlhalane@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '687654322',
        subscription: {
            tier: 'Basic',
            isActive: true,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-29'
        }
    },
    {
        id: 8,
        enterprise_number: 'ENT32145',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Retail',
        name: 'OnlyMoneyIWant Inc',
        email: 'karabelonthoroane@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2025-01-30',
        tax_number: '787654322',
        subscription: {
            tier: 'Basic',
            isActive: true,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-29'
        }

    }
];

router.post('/renew-subscription/:id', async (req, res) => {
    const { id } = req.params;
    const { tier } = req.body;

    let company = companies.find(c => c.id === parseInt(id));
    if (!company) {
        return res.status(404).json({ message: 'Company not found' });
    }

    const currentDate = moment();
    const nextDueDate = moment(company.subscription.nextDueDate);

    if (nextDueDate.isAfter(currentDate)) {
        return res.status(400).json({ message: 'Subscription is not due for renewal yet' });
    }

    const amount = tier === 'Basic' ? '499'
        : tier === 'Professional' ? '999'
        : '2499';

    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: amount,
                },
                description: `${tier} Plan Subscription renewal for ${company.name}`,
            }
        ],
    });

    try {
        const order = await paypalClient.execute(request);
        res.status(200).json({ id: order.result.id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating PayPal order');
    }
});

router.post('/payment-renewal/:id', async (req, res) => {
    const { id } = req.params;
    const { orderID } = req.body;

    let company = companies.find(c => c.id === parseInt(id));
    if (!company) {
        return res.status(404).json({ message: 'Company not found' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await paypalClient.execute(request);

        company.subscription.isActive = true;
        company.subscription.lastPaymentDate = new Date().toISOString();
        company.subscription.nextDueDate = moment().add(1, 'months').toISOString(); // Set next due date for a month later

        res.status(200).json({
            message: 'Subscription renewed successfully',
            captureDetails: capture.result,
            company
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error capturing PayPal order' });
    }
});


router.post('/capture-payment/:id', async (req, res) => {
    const { id } = req.params;
    const { orderID } = req.body;

    const company = companies.find(c => c.id === parseInt(id));
    if (!company) {
        return res.status(404).json({ message: 'Company not found' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await paypalClient.execute(request);

        if (capture.result.status === 'COMPLETED') {
            company.subscription.isActive = true;
            company.subscription.lastPaymentDate = moment().format('YYYY-MM-DD');
            company.subscription.nextDueDate = moment().add(1, 'months').format('YYYY-MM-DD'); 
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

router.get('/subscription-status/:id', async (req, res) => {
    const { id } = req.params;
    const company = companies.find(c => c.id === parseInt(id));

    if (!company) {
        return res.status(404).json({ message: 'Company not found' });
    }

    const currentDate = moment();
    const nextDueDate = moment(company.subscription.nextDueDate);
    const daysUntilDue = nextDueDate.diff(currentDate, 'days');

    console.log(`🔍 Days Until Due: ${daysUntilDue}`);

    if (company.subscription.isActive && nextDueDate.isBefore(currentDate)) {
        return res.status(200).json({ message: 'Subscription is due for renewal' });
    }

    if (!company.subscription.isActive) {
        return res.status(200).json({ message: 'Subscription is inactive' });
    }

    if (company.subscription.isActive && daysUntilDue <= 7 && daysUntilDue > 0) {
        console.log(`📩 Sending email to ${company.email}...`);

        const subject = 'Subscription Renewal Reminder';
        const text = `Hi ${company.name},\n\nYour subscription is about to expire in ${daysUntilDue} days. Please renew it to avoid any interruptions.\n\nBest regards,\nDeez`;
        const html = `<p>Hi ${company.name},</p><p>Your subscription is about to expire in ${daysUntilDue} days. Please renew it to avoid any interruptions.</p><p>Best regards,<br>Nuts</p>`;

        const emailSent = await sendEmail(company.email, subject, text, html);
        if (emailSent) {
            console.log(`📧 Reminder email sent to ${company.name}`);
        } else {
            console.error(`❌ Failed to send reminder email to ${company.name}`);
        }
    } else {
        console.log(`📆 No email sent. Subscription is valid for ${daysUntilDue} more days.`);
    }

    res.status(200).json({ 
        message: 'Subscription is active and valid', 
        subscription: company.subscription 
    });
});
router.post('/create-payment/:id', async (req, res) => {
    const { id } = req.params;
    const { tier, enterprise_number } = req.body;

    let company;

    if (id) {
        company = companies.find(c => c.id === parseInt(id));
    }

    if (!company && enterprise_number) {
        company = companies.find(c => c.enterprise_number === enterprise_number);
    }

    if (!company) {
        return res.status(404).json({ message: 'Company not found' });
    }

    if (!['Basic', 'Professional', 'Enterprise'].includes(tier)) {
        return res.status(400).json({ message: 'Invalid subscription tier' });
    }

    const amount = tier === 'Basic' ? '499'
        : tier === 'Professional' ? '999'
        : '2499';

        const request = new paypal.orders.OrdersCreateRequest();
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: amount,
                    },
                    description: `${tier} Plan Subscription for ${company.name}`,
                }
            ],
            application_context: {
                return_url: 'http://localhost:4000/api/payment/return', 
                cancel_url: 'http://localhost:4000/api/payment/cancel',  
            }
        });

    try {
        const order = await paypalClient.execute(request);
        const approvalUrl = order.result.links.find(link => link.rel === 'approve').href;
        res.status(200).json({ 
            id: order.result.id,
            approval_url: approvalUrl 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating PayPal order' });
    }
});

router.get('/return', async (req, res) => { 
    console.log('Query parameters:', req.query); 

    let { orderID, token} = req.query;

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
            const company = companies.find(c => c.pendingOrderID === orderID);
            if (company) {
                company.subscription = {
                    isActive: true,
                    lastPaymentDate: moment().format('YYYY-MM-DD'),
                    nextDueDate: moment().add(1, 'months').format('YYYY-MM-DD'),
                    tier: tier,
                    features: tierFeatures[tier], 
                };
            }
            return res.status(200).json({ message: 'Payment captured successfully', captureDetails: capture.result, company });
        } else {
            return res.status(400).json({ message: 'Payment was not completed' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error capturing PayPal order' });
    }
});


router.get('/cancel', async (req, res) => {
    const { orderID } = req.query;  

    if (!orderID) {
        return res.status(400).json({ message: 'Missing order ID' });
    }

    const company = companies.find(c => c.pendingOrderID === orderID);
    if (company) {
        company.pendingOrderID = null;  
        console.log(`Payment canceled for company: ${company.name}`);
    }

    res.status(200).json({
        message: 'Payment was canceled. Please try again.'
    });
});

module.exports = router;