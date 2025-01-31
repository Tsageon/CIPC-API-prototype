const { scheduleRemindersForAllCompanies, manualTriggerReminderEmail } = require('../config/Scheduler')

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
            nextDueDate: '2025-02-29'
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
            nextDueDate: '2025-02-29'
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
            nextDueDate: '2025-02-29'
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
            nextDueDate: '2025-02-29'
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
            nextDueDate: '2025-02-29'
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
            nextDueDate: '2025-02-29'
        }

    }
];

exports.getCompanyById = (id) => {
    return companies.find(company => company.id === id);
};

exports.getAnnualReturnDate = (companyName) => {
    const company = companies.find(company => company.name === companyName);
    return company ? company.annualReturnDate : null;
};

exports.getCompanyByEnterpriseNumber = (enterpriseNumber) => {
    return companies.find(company => company.enterprise_number === enterpriseNumber);
};

exports.updateCompany = async (req, res) => {
    const { id } = req.params;
    const { name, email, annualReturnDate, subscription } = req.body; // Fields to update

    if (!name || !email || !annualReturnDate || !subscription) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const index = companies.findIndex(company => company.id === parseInt(id));

        if (index === -1) {
            return res.status(404).json({ error: 'Company not found' });
        }

        companies[index] = {
            ...companies[index],
            name,
            email,
            annualReturnDate,
            subscription
        };

        res.status(200).json(companies[index]);

    } catch (error) {
        res.status(500).json({ error: 'Failed to update company' });
    }
};


exports.manualReminder = async (req, res) => {
    const { email, companyName, annualReturnDate } = req.body;

    if (!email || !companyName || !annualReturnDate) {
        return res.status(400).json({ error: 'Missing required fields (email, companyName, annualReturnDate)' });
    }

    try {
        await manualTriggerReminderEmail(email, companyName, annualReturnDate);
        res.status(200).send('Manual reminder email sent successfully');
    } catch (error) {
        res.status(500).json({ error: 'Failed to send manual reminder email' });
    }
};

exports.triggerReminders = (req, res) => {
    scheduleRemindersForAllCompanies();
    res.send('Reminders are now scheduled.');
};


// const getAllCompanies = () => {
//     console.log('Companies inside getAllCompanies:', companies);
//     return companies;
// };

exports.getAllCompanies = () => {
    return companies;
}
