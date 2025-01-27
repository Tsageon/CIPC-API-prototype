const express = require('express');
const router = express.Router();
const businessController = require('../controllers/Business')

router.post('/send-email',businessController.sendReminderEmail);

module.exports = router;