const nodemailer = require('nodemailer');
const cron = require('node-cron');
const moment = require('moment');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `🚀"Document Renewal Company Compliance" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log('📧Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('❌Error sending email:', error);
        return false;
    }
};

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

const scheduleReminder = (email, companyName, annualReturnDate) => {
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

    const cronExpression = `0 6 ${dueDate.date()} ${dueDate.month() + 1} *`; // Use "dueDate"
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

cron.schedule('0 0 * * *', () => {
    const currentDate = moment();
    companies.forEach(company => {
        const nextDueDate = moment(company.subscription.nextDueDate);

        if (nextDueDate.isBefore(currentDate.add(7, 'days'))) {
            sendSubscriptionRenewalReminder(company);
        }
    });
});

async function sendSubscriptionRenewalReminder(company) {
    const subject = 'Your Subscription is Due for Renewal';
    const text = `Dear ${company.name},\n\nYour subscription is due for renewal on ${company.subscription.nextDueDate}. Please visit our site to complete the payment process.\n\nThank you for being a valued customer!`;
    const html = `<p>Dear <strong>${company.name}</strong>,</p><p>Your subscription is due for renewal on <strong>${company.subscription.nextDueDate}</strong>. Please visit our site to complete the payment process.</p><p>Thank you for being a valued customer!</p>`;

    const success = await sendEmail(company.email, subject, text, html);
    if (success) {
        console.log(`Renewal reminder email sent to ${company.name}`);
    } else {
        console.error(`Failed to send renewal reminder email to ${company.name}`);
    }
}

module.exports = { sendEmail, scheduleReminder };