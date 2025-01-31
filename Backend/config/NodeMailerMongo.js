const moment = require('moment');
const cron = require('node-cron');
const { sendEmail } = require('./Nodemailer'); 
const Company = require('../models/Company');


const sendReminderEmail = async (email, companyName, dueDate) => {
    const subject = `Document Renewal Reminder for ${companyName}`;
    const text = `This is a reminder that ${companyName}'s annual return is due on ${dueDate}. Please file it promptly to avoid penalties.`;
    const html = `<p>This is a reminder that <strong>${companyName}'s</strong> annual return is due on <strong>${dueDate}</strong>. Please file it promptly to avoid penalties.</p>`;

    const success = await sendEmail(email, subject, text, html);
    if (success) {
        console.log(`Reminder email successfully sent to ${companyName}`);
    } else {
        console.error(`Failed to send reminder email to ${companyName}`);
    }
};


const ScheduleReminder = (email, companyName, annualReturnDate) => {
    const dueDate = moment(annualReturnDate, 'YYYY-MM-DD');

    if (!dueDate.isValid()) {
        console.error(`Invalid annual return date for ${companyName}: ${annualReturnDate}`);
        return;
    }

    const now = moment();
    const daysUntilDueDate = dueDate.diff(now, 'days');

    if (daysUntilDueDate <= 0) {
        console.warn(`The annual return for ${companyName} is already due or overdue.`);
        return;
    }

    const cronExpression = `0 6 ${dueDate.date()} ${dueDate.month() + 1} *`; 
    console.log(`Cron expression for ${companyName}: ${cronExpression}`);

    cron.schedule(
        cronExpression,
        () => {
            console.log(`Sending reminder email to ${companyName}...`);
            sendReminderEmail(email, companyName, dueDate.format('YYYY-MM-DD'));
        },
        {
            timezone: 'America/New_York',
        }
    );

    console.log(`Reminder scheduled for ${companyName} on ${dueDate.format('YYYY-MM-DD')}`);
};

cron.schedule('0 0 * * *', async () => {
    const currentDate = moment();

    try {
        const companies = await Company.find(); 

        companies.forEach(company => {
            const nextDueDate = moment(company.subscription.next_payment_due);

            if (nextDueDate.isBefore(currentDate.add(7, 'days'))) {
                sendSubscriptionReminder(company);
            }
        });
    } catch (err) {
        console.error('Error fetching companies:', err);
    }
});

async function sendSubscriptionReminder(company) {
    const subject = 'Your Subscription is Due for Renewal';
    const text = `Dear ${company.companyName},\n\nYour subscription is due for renewal on ${company.subscription.next_payment_due}. Please visit our site to complete the payment process.\n\nThank you for being a valued customer!`;
    const html = `<p>Dear <strong>${company.companyName}</strong>,</p><p>Your subscription is due for renewal on <strong>${company.subscription.next_payment_due}</strong>. Please visit our site to complete the payment process.</p><p>Thank you for being a valued customer!</p>`;

    const success = await sendEmail(company.email, subject, text, html);
    if (success) {
        console.log(`Renewal reminder email sent to ${company.companyName}`);
    } else {
        console.error(`Failed to send renewal reminder email to ${company.companyName}`);
    }
}

const scheduleAnnualReturn = async () => {
    try {
        const companies = await Company.find(); 

        companies.forEach(company => {
            if (company.annualReturnDate) {
                ScheduleReminder(company.email, company.companyName, company.annualReturnDate);
            }
        });
    } catch (err) {
        console.error('Error scheduling annual return reminders:', err);
    }
};

scheduleAnnualReturn();

module.exports = { ScheduleReminder };