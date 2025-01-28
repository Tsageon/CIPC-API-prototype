const express = require('express');
const router = express.Router();
const businessController = require('../controllers/Business')

router.get('/search', businessController.searchEnterprise);
router.get('/company',  businessController.fetchCompanyData);
router.post('/send-email', businessController.sendReminderEmail);

module.exports = router;