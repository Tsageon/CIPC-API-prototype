const express = require('express');
const cors = require('cors');
const connectDB = require('./config/mongodb')
const companyRoutes = require('./routes/CompanyR');
const paymentRoutes = require('./controllers/Paypal');
const checkoutRoutes = require('./controllers/StripeC');
const webhookRoutes = require('./routes/StripeWebhookRoutes');
const mongoPaymentRoutes = require('./controllers/MongoPaypal');
const mockRoutes = require('./routes/BusinessRoutes');
const app = express();


connectDB();
app.use(express.json());
app.use(cors());

app.use('/api/', mockRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/stripe',webhookRoutes)
app.use('/api/companies', companyRoutes);
app.use('/api/companies/stripe', checkoutRoutes);
app.use('/api/companies/pay', mongoPaymentRoutes);


const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});