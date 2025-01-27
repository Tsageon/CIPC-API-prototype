const axios = require('axios');
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
            from: `"Document Renewal Notification" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log('Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const sendReminderEmail = async (email, companyName, expirationDate) => {
    const subject = `Document Renewal Reminder for ${companyName}`;
    const text = `This is a reminder that ${companyName}'s annual return is due on ${expirationDate}. Please file it promptly to avoid penalties.`;
    const html = `<p>This is a reminder that <strong>${companyName}'s</strong> annual return is due on <strong>${expirationDate}</strong>. Please file it promptly to avoid penalties.</p>`;

    const success = await sendEmail(email, subject, text, html);
    if (success) {
        console.log(`Reminder email successfully sent to ${companyName}`);
    } else {
        console.error(`Failed to send reminder email to ${companyName}`);
    }
};

const scheduleReminder = (email, companyName, annualReturnDate) => {
    const expiration = moment(annualReturnDate, 'YYYY-MM-DD');

    if (!expiration.isValid()) {
        console.error(`Invalid annual return date for ${companyName}: ${annualReturnDate}`);
        return;
    }

    const now = moment();
    const daysUntilExpiration = expiration.diff(now, 'days');

    if (daysUntilExpiration <= 0) {
        console.warn(`The annual return for ${companyName} is already due or overdue.`);
        return;
    }

    const cronExpression = `0 6 ${expiration.date()} ${expiration.month() + 1} *`;
    console.log(`Cron expression for ${companyName}: ${cronExpression}`);

    cron.schedule(
        cronExpression,
        () => {
            console.log(`Sending reminder email to ${companyName}...`);
            sendReminderEmail(email, companyName, expiration.format('YYYY-MM-DD'));
        },
        {
            timezone: 'America/New_York',
        }
    );

    console.log(`Reminder scheduled for ${companyName} on ${expiration.format('YYYY-MM-DD')}`);
};

const fetchCompanyData = async () => {
    try {
        const response = await axios.get('https://cipc-apm-rs-dev.azure-api.net/enterprise/v1/filing-history');
        const filingsHistoryList = response.data?.filings_history_list;

        if (Array.isArray(filingsHistoryList) && filingsHistoryList.length > 0) {
            filingsHistoryList.forEach((filing) => {
                const { annual_return_date: annualReturnDate, status, email_address: email, company_name: companyName } = filing;

                if (status === 'Active' && annualReturnDate && email) {
                    scheduleReminder(email, companyName, annualReturnDate);
                } else {
                    console.warn(`Missing email or invalid data for filing:`, filing);
                }
            });
        } else {
            console.log('No filings found in the API response.');
        }
    } catch (error) {
        console.error('Error fetching company data:', error.message);
    }
};

const searchEnterprise = async (enterpriseNumber) => {
    try {
        const response = await axios.post('https://cipc-apm-rs-dev.azure-api.net/enterprise/v1/information', {
            enterprise_number: enterpriseNumber,
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = response.data?.Enterprise;
        if (data) {
            console.log(`Enterprise Details for ${enterpriseNumber}:`, data);
            return data;
        } else {
            console.error(`No information found for enterprise number: ${enterpriseNumber}`);
        }
    } catch (error) {
        console.error('Error searching enterprise:', error.message);
    }
};

const main = async () => {
    await fetchCompanyData();

   
    const enterpriseNumber = process.env.ENTERPRISE_NUMBER || '2020/939681/07';
    const enterpriseData = await searchEnterprise(enterpriseNumber);

    if (enterpriseData) {
        console.log('Enterprise data retrieved successfully:', enterpriseData);
    }
};

main();

module.exports = { sendEmail, scheduleReminder, searchEnterprise, fetchCompanyData };
