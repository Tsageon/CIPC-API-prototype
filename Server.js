const express = require('express');
const cors = require('cors');
const connectDB = require('./config/mongodb')
const { scheduleRemindersForAllCompanies, manualTriggerReminderEmail } = require('./config/Scheduler');
const { getAllCompanies, getCompanyById, getCompanyByEnterpriseNumber } = require('./controllers/mockCipcService');
const companyRoutes = require('./routes/CompanyR');
const app = express();

connectDB();
app.use(express.json());
app.use(cors());


app.use('/api/', companyRoutes);

app.get('/api/companies', (req, res) => {
    const companies = getAllCompanies();
    res.json(companies);
});

app.get('/api/companies/:id', (req, res) => {
    console.log('Received ID:', req.params.id);
    const company = getCompanyById(parseInt(req.params.id));
    if (company) {
        res.json(company);
    } else {
        res.status(404).json({ error: 'Company not found' });
    }
});

app.post('/api/companies/trigger-reminders', (req, res) => {
    scheduleRemindersForAllCompanies();
    res.send('Reminders are now scheduled.');
});

app.post('/api/manual-reminder', async (req, res) => {
    const { email, companyName, annualReturnDate } = req.body; 

    if (!email || !companyName || !annualReturnDate) {
        return res.status(400).json({ error: 'Missing required fields (email, companyName, annualReturnDate)' });
    }

    try {
        await manualTriggerReminderEmail(email, companyName, annualReturnDate);
        res.status(200).send('Manual reminder email sent successfully');
    } catch (error) {
        res.status(500).json({ error: 'Failed to send manual reminder email' });
    }
});

app.get('/api/companies/:enterpriseNumber', (req, res) => {
    const { enterpriseNumber } = req.params;
    console.log('Received Enterprise Number:', enterpriseNumber);
    const company = getCompanyByEnterpriseNumber(enterpriseNumber);
    if (company) {
        res.json(company);
    } else {
        res.status(404).json({ error: 'Company not found' });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
