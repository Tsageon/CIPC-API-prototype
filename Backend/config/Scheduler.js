const cron = require('node-cron');
const moment = require('moment');
const Company = require('../models/Company');
const { sendEmail } = require('./Nodemailer');

const companies = [
    {
        id: 1,
        enterprise_number: 'ENT12345',
        enterprise_type_description: 'Private Company',
        sic_description: 'Sole Proprietorship',
        name: 'Sausage Party',
        email: 'mylasjacob18.5@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '345632167',
        subscription: {
            tier: 'Basic',
            isActive: false,
            lastPaymentDate: '2025-01-01',
            nextDueDate: '2025-02-01'
        }
    },
    {
        id: 2,
        enterprise_number: 'ENT67890',
        enterprise_type_description: 'Private Company',
        sic_description: 'Corporation',
        name: 'WHY Code!tm',
        email: 'ayandasontlaba6@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '234567891',
        subscription: {
            tier: 'Basic',
            isActive: false,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-28'
        }
    },
    {
        id: 3,
        enterprise_number: 'ENT11223',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Manufacturing',
        name: 'Cassanova United',
        email: 'khanyajara@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '123456789',
        subscription: {
            tier: 'Professional',
            isActive: true,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-28'
        }
    },
    {
        id: 4,
        enterprise_number: 'ENT45678',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Retail Trade',
        name: 'AAUUUUH',
        email: 'rethabilechomi610@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '987654322',
        subscription: {
            tier: 'Basic',
            isActive: true,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-28'
        }
    },
    {
        id: 5,
        enterprise_number: 'ENT32142',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Retail Trade',
        name: 'BLacKLaBoLe',
        email: 't88segamie@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '487654322',
        subscription: {
            tier: 'Enterprise',
            isActive: true,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-10'
        }
    },
    {
        id: 6,
        enterprise_number: 'ENT32143',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Retail',
        name: 'SparkX',
        email: 'llewellyn.ml.info@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '587654322',
        subscription: {
            tier: 'Basic',
            isActive: true,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-28'
        }
    },
    {
        id: 7,
        enterprise_number: 'ENT32144',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Retail',
        name: 'Inquixix',
        email: 'ytmotlhalane@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2026-01-30',
        tax_number: '687654322',
        subscription: {
            tier: 'Basic',
            isActive: true,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-28'
        }
    },
    {
        id: 8,
        enterprise_number: 'ENT32145',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Retail',
        name: 'OnlyMoneyIWant Inc',
        email: 'karabelonthoroane@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2025-01-30',
        tax_number: '787654322',
        subscription: {
            tier: 'Basic',
            isActive: true,
            lastPaymentDate: '2025-01-30',
            nextDueDate: '2025-02-28'
        }

    }
];

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

    let reminderSent = true;

    scheduledJobs[companyName] = cronSchedules.map(({ expr, message }) => {
        const job = cron.schedule(expr, async () => {
            console.log(message);
            await sendReminderEmail(email, companyName, expiration.format('YYYY-MM-DD'));
            reminderSent = true;
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

const checkSubscriptions = async () => {
    console.log('⏳ Running subscription check...');

    const currentDate = moment();

    for (const company of companies) {
        if (!company.subscription?.nextDueDate) {
            console.error(`⚠️ Missing nextDueDate for ${company.name}`);
            continue;
        }

        const nextDueDate = moment(company.subscription.nextDueDate, 'YYYY-MM-DD', true);
        if (!nextDueDate.isValid()) {
            console.error(`❌ Invalid date format: ${company.subscription.nextDueDate}`);
            continue;
        }

        const daysUntilDue = nextDueDate.diff(currentDate, 'days');

        console.log(`🔍 ${company.name} - Days Until Due: ${daysUntilDue}`);

        if (company.subscription.isActive && daysUntilDue <= 7 && daysUntilDue > 0) {
            console.log(`📩 Sending email to ${company.email}...`);

            const subject = 'Subscription Renewal Reminder';
            const text = `Hi ${company.name},\n\nYour subscription is about to expire in ${daysUntilDue} days. Please renew it to avoid any interruptions.\n\nBest regards,\nDeez`;
            const html = `<p>Hi ${company.name},</p><p>Your subscription is about to expire in ${daysUntilDue} days. Please renew it to avoid any interruptions.</p><p>Best regards,<br>Nuts</p>`;

            try {
                const emailSent = await sendEmail(company.email, subject, text, html);
                if (emailSent) {
                    console.log(`📧 Reminder email sent to ${company.name}`);
                } else {
                    console.error(`❌ Failed to send reminder email to ${company.name}`);
                }
            } catch (error) {
                console.error(`❌ Email sending error: ${error.message}`);
            }
        } else {
            console.log(`📆 No email needed for ${company.name}. Subscription is valid.`);
        }
    }

    console.log('✅ Subscription check completed.');
};

cron.schedule('* * * * *', async () => {
    await checkSubscriptions();
    console.log('⏰ Daily subscription check ran.');
});

checkSubscriptions()


const scheduleRemindersForAllCompanies = () => { 
    console.log('Companies inside scheduleRemindersForAllCompanies:', companies); 
    companies.forEach(company => {
        const { name, email, annualReturnDate } = company;
        scheduleReminder(name, email, annualReturnDate);
    });
};

scheduleRemindersForAllCompanies();

module.exports = { scheduleRemindersForAllCompanies, manualTriggerReminderEmail };