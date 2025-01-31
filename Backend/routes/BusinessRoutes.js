const express = require('express');
const router = express.Router();
const checkFeature = require('../middleware/CheckAccess');
const mockController = require('../controllers/mockCipcService');
const businessController = require('../controllers/Business')

router.get('/search', businessController.searchEnterprise);
router.get('/companies', mockController.getAllCompanies);
router.get('/company/:id', mockController.getCompanyById);
router.get('/company/:enterpriseNumber', mockController.getCompanyByEnterpriseNumber);
router.get('/company', businessController.fetchCompanyData);
router.get('/advanced-tools', checkFeature('advancedTools'), (req, res) => {
    res.json({ message: 'Welcome to advanced tools!' });
});
router.get('/notarized-documents', checkFeature('notarizedDocuments'), (req, res) => {
    res.json({ message: 'Here are your notarized documents.' });
});
router.post('/companies/trigger-reminders', mockController.triggerReminders);
router.post('/manual-reminder', mockController.manualReminder);
router.post('/send-email', businessController.sendReminderEmail);
router.put('/company/:id', mockController.updateCompany);

module.exports = router;