const companies = [
    {
        id: 1,
        enterprise_number: 'ENT12345',
        enterprise_type_description: 'Private Company',
        sic_description: 'Sole Proprietorship',
        name: 'Message Sausage',
        email: 'mylasjacob18.5@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2025-01-30',
        tax_number: '345632167',
    },
    {
        id: 2,
        enterprise_number: 'ENT67890',
        enterprise_type_description: 'Private Company',
        sic_description: 'Corporation',
        name: 'WHY Code!tm',
        email: 'ayandasontlaba6@gmail.com',
        registration_date: '2024-01-30',
        annualReturnDate: '2025-01-30',
        tax_number: '234567891',
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
        annualReturnDate: '2025-01-30',
        tax_number: '123456789',
    },
    {
        id: 4,
        enterprise_number: 'ENT45678',
        enterprise_status_description: 'Active',
        enterprise_type_description: 'Private Company',
        sic_description: 'Retail Trade',
        name: 'AAUUUUH',
        email: 'rethabilechomi610@gmail.com ',
        registration_date: '2024-01-30',
        annualReturnDate: '2025-01-30',
        tax_number: '987654322',
    }
];


const getCompanyById = (id) => {
    return companies.find(company => company.id === id);
};

const getAllCompanies = () => {
    return companies;
};

const getAnnualReturnDate = (companyName) => {
    const company = companies.find(company => company.name === companyName);
    return company ? company.annualReturnDate : null;
};

const getCompanyByEnterpriseNumber = (enterpriseNumber) => {
    return companies.find(company => company.enterprise_number === enterpriseNumber);
};

module.exports = { getCompanyById, getAllCompanies, getAnnualReturnDate, getCompanyByEnterpriseNumber };
