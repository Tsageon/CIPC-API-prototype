const sendEmail = require('../config/Nodemailer');

exports.sendReminderEmail = async (req, res) => {
    const { to, subject, text, html } = req.body;
  
    const success = await sendEmail(to, subject, text, html); 
    if (success) {
      res.status(200).json({ message: 'Email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send email' });
    }
  };
  
