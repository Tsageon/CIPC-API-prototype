const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config();

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

function createEnvironment() {
    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    return new paypal.core.PayPalHttpClient(environment);
}

const paypalClient = createEnvironment();

module.exports = paypalClient;
