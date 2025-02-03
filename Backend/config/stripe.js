const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51QoKRXFf74IWMhMzcECI7aiAR2tlLUmEWIfVrGAKiek1sZtqUCj456uqrw9YOOTMvIgQlrFmBhNmJpY6Se9h3lf100a2IQzr8d');
require('dotenv').config();

module.exports = stripe;