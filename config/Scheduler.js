const cron = require('node-cron');
const moment = require('moment');
const Company = require('../models/Company');
const { sendEmail } = require('./Nodemailer');
const { getAllCompanies } = require('../controllers/mockCipcService'); 

const manualTriggerReminderEmail = async (email, companyName, annualReturnDate) => {
    const subject = `Manual Document Renewal Reminder for ${companyName}`;
    const text = `This is a manual reminder that ${companyName}'s annual return is due on ${annualReturnDate}. Please file it promptly to avoid penalties.`;
    const html = `<p>This is a manual reminder that <strong>${companyName}'s</strong> annual return is due on <strong>${annualReturnDate}</strong>. Please file it promptly to avoid penalties.</p>`;

    try {
        const success = await sendEmail(email, subject, text, html);
        if (success) {
            console.log(`Manual reminder email successfully sent to ${companyName}`);
        } else {
            console.error(`Failed to send manual reminder email to ${companyName}`);
        }
    } catch (error) {
        console.error(`Error sending manual reminder email for ${companyName}:`, error);
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
            console.error(`Failed to send reminder to ${companyName}: ${error.message}`);;
        }
    } catch (error) {
        console.error('Error sending reminder email:', error);
    }
};

const validateDate = (dateString, companyName) => {
    const expiration = moment(dateString, 'YYYY-MM-DD');
    if (!expiration.isValid()) {
        console.error(`Invalid annual return date for ${companyName}: ${dateString}`);
        return false;
    }
    return expiration;
};

const scheduledJobs = {}; 

const scheduleReminder = (companyName, email, annualReturnDate) => {
    const expiration = validateDate(annualReturnDate, companyName);
    if (!expiration) return;

    const now = moment().utc(); 

    const daysUntilExpiration = expiration.diff(now, 'days');

    if (daysUntilExpiration <= 0) {
        console.warn(`The annual return for ${companyName} is already due or overdue.`);
        sendReminderEmail(email, companyName, expiration.format('YYYY-MM-DD'));
        clearCronJobForCompany(companyName);
        return;
    }

    if (scheduledJobs[companyName]) {
        console.log(`Clearing existing reminder jobs for ${companyName}`);
        scheduledJobs[companyName].forEach(job => job.stop());
    } else {
        console.log(`No existing jobs found for ${companyName}`);
    }

    const cronExpressionBefore = `0 6 ${expiration.date() - 1} ${expiration.month() + 1} *`; 
    const cronExpressionDue = `0 6 ${expiration.date()} ${expiration.month() + 1} *`; 
    const cronExpressionOverdue = `0 6 ${expiration.date() + 1} ${expiration.month() + 1} *`;

    const cronSchedules = [
        { expr: cronExpressionBefore, message: 'Sending reminder before due date...' },
        { expr: cronExpressionDue, message: 'Sending reminder on due date...' },
        { expr: cronExpressionOverdue, message: 'Sending overdue reminder...' }
    ];

    let reminderSent = false;

    scheduledJobs[companyName] = cronSchedules.map(({ expr, message }) => {
        const job = cron.schedule(expr, async () => {
            console.log(message);
            await sendReminderEmail(email, companyName, expiration.format('YYYY-MM-DD'));
            reminderSent  = true;
            job.stop();
        },
        { timezone: 'Africa/Johannesburg' });

        return job;
    });
};

const clearCronJobForCompany = (companyName) => {
    if (scheduledJobs[companyName]) {
        console.log(`Clearing all reminder jobs for ${companyName}`);
        scheduledJobs[companyName].forEach(job => job.stop());
        delete scheduledJobs[companyName];  
    }
};

cron.schedule('*/5 * * * *', async () => {
    console.log("Adjusting company dates and checking for reminders...");

    const companies = await Company.find(); 

    for (let company of companies) {
        const registrationDate = moment(company.registration_date).tz("Africa/Johannesburg").toDate();
        const annualReturnDate = moment(company.annualReturnDate).tz("Africa/Johannesburg").toDate();
        
        company.registration_date = registrationDate;
        company.annualReturnDate = annualReturnDate;
        await company.save(); 

        const today = moment().tz("Africa/Johannesburg").startOf("day");
        const dueDate = moment(annualReturnDate).startOf("day");

        if (dueDate.isSame(today)) {
            console.log(`Sending reminder to: ${company.email}`);
            await sendEmail({
                to: company.email,
                subject: "Annual Return Due Reminder",
                text: `Dear ${company.name},\n\nYour annual return is due today (${moment(annualReturnDate).format("YYYY-MM-DD")}).\n\nPlease take the necessary action.\n\nBest regards,\nYour CC Team`
            });
        }
    }

    console.log("Company dates adjusted and reminders checked!");
});


const scheduleRemindersForAllCompanies = () => {
    const companies = getAllCompanies();
    companies.forEach(company => {
        const { name, email, annualReturnDate } = company;
        scheduleReminder(name, email, annualReturnDate);
    });
};

scheduleRemindersForAllCompanies();

module.exports = { scheduleRemindersForAllCompanies, manualTriggerReminderEmail };
