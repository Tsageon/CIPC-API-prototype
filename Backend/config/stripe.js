const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

module.exports = stripe;