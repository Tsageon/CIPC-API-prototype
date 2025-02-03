const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
require('dotenv').config();

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

module.exports = router;
