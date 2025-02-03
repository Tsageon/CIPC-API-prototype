const express = require('express');
const stripe = require('../config/stripe');
require('dotenv').config();
const router = express.Router();

const YOUR_DOMAIN = process.env.YOUR_DOMAIN || 'http://localhost:4000';

router.post('/create-portal-session', async (req, res, next) => {
  try {
    const { session_id } = req.body;
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    const returnUrl = YOUR_DOMAIN;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer,
      return_url: returnUrl,
    });

    res.redirect(303, portalSession.url);
  } catch (err) {
    next(err);
  }
});


router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('⚠️  Webhook signature verification failed.', err.message);
        return res.status(400).json({ message: 'Webhook signature verification failed' });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const enterprise_number = session.client_reference_id;

        let company = await Company.findOne({ enterprise_number });
        if (company) {
            company.subscription = {
                plan: session.metadata.subscription_type,
                status: 'active',
                last_payment_date: moment().format('YYYY-MM-DD'),
                next_payment_due: moment().add(1, 'months').format('YYYY-MM-DD')
            };
            await company.save();
        }
    }

    res.status(200).json({ received: true });
});

module.exports = router;