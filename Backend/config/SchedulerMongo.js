const cron = require('node-cron');
const moment = require('moment');
const Company = require('../models/Company');
const { sendEmail } = require('../config/Nodemailer');

const scheduleReminder = (company) => {
    const { companyName, email, annualReturnDate } = company;
    const daysUntilReturn = moment(annualReturnDate).diff(moment(), 'days');

    if (daysUntilReturn <= 7 && daysUntilReturn > 0) {
        const subject = `Reminder: Annual Return for ${companyName}`;
        const text = `Hi, this is a reminder that your annual return for ${companyName} is due in ${daysUntilReturn} days.`;
        sendEmail(email, subject, text, `<p>${text}</p>`);
    } else if (daysUntilReturn === 1) {
        const subject = `Urgent: Annual Return Due Tomorrow for ${companyName}`;
        const text = `Hi, this is an urgent reminder that your annual return for ${companyName} is due tomorrow.`;
        sendEmail(email, subject, text, `<p>${text}</p>`);
    }
};

const scheduleRemindersForAllCompanies = async () => {
    try {
        const companies = await Company.find({ "subscription.status": "active" }); // Filter for active subscriptions
        companies.forEach(company => {
            scheduleReminder(company);
        });
    } catch (err) {
        console.error('Error fetching companies for annual return reminders:', err);
    }
};

const handleSubscriptionReminders = (company) => {
    const { companyName, email, subscription } = company;
    const daysUntilPayment = moment(subscription.next_payment_due).diff(moment(), 'days');


    if (daysUntilPayment <= 7 && daysUntilPayment > 0) {
        const subject = `Reminder: Subscription Payment for ${companyName}`;
        const text = `Hi, your subscription payment for ${companyName} is due in ${daysUntilPayment} days. Please make sure to process it.`;
        sendEmail(email, subject, text, `<p>${text}</p>`);
    } else if (daysUntilPayment === 1) {
        const subject = `Urgent: Subscription Payment Due Tomorrow for ${companyName}`;
        const text = `Hi, your subscription payment for ${companyName} is due tomorrow. Please make sure to process it.`;
        sendEmail(email, subject, text, `<p>${text}</p>`);
    }
};

const scheduleSubRemindersForAllCompanies = async () => {
    try {
        const companies = await Company.find({ "subscription.status": "active" }); // Filter for active subscriptions
        companies.forEach(company => {
            handleSubscriptionReminders(company);
        });
    } catch (err) {
        console.error('Error fetching companies for subscription reminders:', err);
    }
};

cron.schedule('0 0 * * *', () => {
    console.log('Checking for upcoming annual return and subscription reminders...');
    scheduleRemindersForAllCompanies();
    scheduleSubRemindersForAllCompanies();
});

scheduleRemindersForAllCompanies();
scheduleSubRemindersForAllCompanies();