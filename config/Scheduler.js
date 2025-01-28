const cron = require('node-cron');
const moment = require('moment');
const { sendEmail } = require('./Nodemailer');
const { getAllCompanies } = require('../controllers/mockCipcService'); 

const manualTriggerReminderEmail = async (email, companyName, annualReturnDate) => {
    
    const subject = `Manual Document Renewal Reminder for ${companyName}`;
    const text = `This is a manual reminder that ${companyName}'s annual return is due on ${annualReturnDate}. Please file it promptly to avoid penalties.`;
    const html = `<p>This is a manual reminder that <strong>${companyName}'s</strong> annual return is due on <strong>${annualReturnDate}</strong>. Please file it promptly to avoid penalties.</p>`;

    const success = await sendEmail(email, subject, text, html);
    if (success) {
        console.log(`Manual reminder email successfully sent to ${companyName}`);
    } else {
        console.error(`Failed to send manual reminder email to ${companyName}`);
    }
};

const sendReminderEmail = async (email, companyName, expirationDate) => {
    const subject = `Document Renewal Reminder for ${companyName}`;
    const text = `This is a reminder that ${companyName}'s annual return is due on ${expirationDate}. Please file it promptly to avoid penalties.`;
    const html = `<p>This is a reminder that <strong>${companyName}'s</strong> annual return is due on <strong>${expirationDate}</strong>. Please file it promptly to avoid penalties.</p>`;

    try {
        const success = await sendEmail(email, subject, text, html);
        if (success) {
            console.log(`Reminder email successfully sent to ${companyName}`);
        } else {
            console.error(`Failed to send reminder email to ${companyName}`);
        }
    } catch (error) {
        console.error('Error sending reminder email:', error);
    }
};

const scheduleReminder = (companyName, email, annualReturnDate) => {
    const expiration = moment(annualReturnDate, 'YYYY-MM-DD');

    if (!expiration.isValid()) {
        console.error(`Invalid annual return date for ${companyName}: ${annualReturnDate}`);
        return;
    }

    const now = moment();
    const daysUntilExpiration = expiration.diff(now, 'days');

    if (daysUntilExpiration <= 0) {
        console.warn(`The annual return for ${companyName} is already due or overdue.`);
    }

    const cronExpressionBefore = `0 6 ${expiration.date() - 1} ${expiration.month() + 1} *`;
    const cronExpressionDue = `0 6 ${expiration.date()} ${expiration.month() + 1} *`;
    const cronExpressionOverdue = `0 6 ${expiration.date()} ${expiration.month() + 1} *`;

    if (daysUntilExpiration <= 0) {
        console.log(`Sending immediate reminder email to ${companyName}...`);
        sendReminderEmail(email, companyName, expiration.format('YYYY-MM-DD'));
    }

    cron.schedule(cronExpressionBefore, () => {
        sendReminderEmail(email, companyName, expiration.format('YYYY-MM-DD'));
    }, { timezone: 'Africa/Johannesburg' });

    cron.schedule(cronExpressionDue, () => {
        sendReminderEmail(email, companyName, expiration.format('YYYY-MM-DD'));
    }, { timezone: 'Africa/Johannesburg' });

    cron.schedule(cronExpressionOverdue, () => {
        console.log(`Sending overdue reminder email to ${companyName}...`);
        sendReminderEmail(email, companyName, expiration.format('YYYY-MM-DD'));
    }, { timezone: 'Africa/Johannesburg' });
};


const scheduleRemindersForAllCompanies = () => {
    const companies = getAllCompanies();
    companies.forEach(company => {
        const { name, email, annualReturnDate } = company;
        scheduleReminder(name, email, annualReturnDate);
    });
};

scheduleRemindersForAllCompanies();

module.exports = { scheduleRemindersForAllCompanies, manualTriggerReminderEmail };
