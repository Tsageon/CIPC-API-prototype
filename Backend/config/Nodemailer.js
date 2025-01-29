const axios = require('axios');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const readline = require('readline');
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



const getEnterpriseNumber = () => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('Enter enterprise number: ', (input) => {
            rl.close();
            resolve(input || process.env.ENTERPRISE_NUMBER || '2020/939681/07');
        });
    });
};

const main = async () => {
    const enterpriseNumber = await getEnterpriseNumber();
    const enterpriseData = await searchEnterprise(enterpriseNumber);

    if (enterpriseData) {
        console.log('Enterprise data retrieved successfully:', enterpriseData);
    }
};

main();

module.exports = { sendEmail, scheduleReminder };