const express = require('express');
const router = express.Router();
const moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Company = require('../models/Company');


router.post('/payment/:id', async (req, res) => {
    const { id } = req.params;
    const { sub, enterprise_number } = req.body;
    
    try {
        let company = await Company.findById(id);
        if (!company && enterprise_number) {
            company = await Company.findOne({ enterprise_number });
        }
        if (!company) return res.status(404).json({ message: 'Company not found' });

        const availableSubs = { basic: 499, professional: 999, enterprise: 2499 };
        if (!availableSubs[sub]) return res.status(400).json({ message: 'Invalid subscription plan' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'link'],
            mode: 'subscription',
            customer_email: company.email,
            client_reference_id: company.enterprise_number, 
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `${sub.charAt(0).toUpperCase() + sub.slice(1)} Plan Subscription` },
                    unit_amount: availableSubs[sub] * 100,
                    recurring: { interval: 'month' }
                },
                quantity: 1
            }],
            success_url: `${process.env.HOSTED_URL}/api/companies/stripe/success`,
            cancel_url: `${process.env.HOSTED_URL}/api/companies/stripe/cancel`
        });

        res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating Stripe session' });
    }
});

router.get('/success', async (req, res) => {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ message: 'Missing session ID' });

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status !== 'paid') return res.status(400).json({ message: 'Payment not completed' });

        const company = await Company.findOne({ enterprise_number: session.client_reference_id });
        if (company) {
            company.subscription = {
                plan: session.metadata.subscription_type,
                status: 'active',
                last_payment_date: moment().format('YYYY-MM-DD'),
                next_payment_due: moment().add(1, 'months').format('YYYY-MM-DD')
            };
            await company.save();
        }

        res.status(200).json({ message: 'Payment successful', session });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error verifying payment' });
    }
});

router.get('/cancel', async (res) => {
    res.status(200).json({ message: 'Payment was canceled. Please try again.' });
});

module.exports = router;