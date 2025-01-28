const { sendEmail } = require('../config/Nodemailer');
const { fetchCompanyData, searchEnterprise } = require('../services/BusinessS');

exports.sendReminderEmail = async (req, res, next) => {
  try {
      const { to, subject, text, html } = req.body;

      if (!to || !subject || !text) {
          return res.status(400).json({ message: 'Missing required fields: to, subject, or text.' });
      }
      const success = await sendEmail(to, subject, text, html);
      if (success) {
          res.status(200).json({ message: 'Email sent successfully.' });
      } else {
          res.status(500).json({ message: 'Failed to send email.' });
      }
  } catch (error) {
      next(error);
  }
};

exports.fetchCompanyData = async (res) => {
  try {
      const companyData = await fetchCompanyData();

      if (!companyData || companyData.length === 0) {
          return res.status(404).json({ error: 'No company data found' });
      }

      res.status(200).json({ companies: companyData });
  } catch (error) {
      console.error('Error fetching company data:', {
          message: error.message,
          stack: error.stack,
      });

      res.status(500).json({
          error: 'An error occurred while fetching company data. Please try again later.',
      });
  }
};

exports.searchEnterprise = async (req, res) => {
  const { enterpriseNumber } = req.body;

  if (!enterpriseNumber) {
      return res.status(400).json({ error: 'Enterprise number is required' });
  }

  try {
      const enterpriseData = await searchEnterprise(enterpriseNumber);

      if (enterpriseData) {
          res.status(200).json(enterpriseData);
      } else {
          res.status(404).json({ error: 'Enterprise not found' });
      }
  } catch (error) {
      console.error('Error searching enterprise:', {
          message: error.message,
          stack: error.stack,
          enterpriseNumber,
      });

      res.status(500).json({
          error: 'An error occurred while searching for the enterprise. Please try again later.',
      });
  }};