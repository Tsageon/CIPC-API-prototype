const axios = require('axios');

const fetchCompanyData = async () => {
    try {
        const response = await axios.get('https://cipc-apm-rs-dev.azure-api.net/enterprise/v1/information');
        return response.data?.companies || [];
    } catch (error) {
        console.error('Error fetching company data:', error.message);
        throw error;
    }
};

const searchEnterprise = async (enterpriseNumber) => {
    try {
        const response = await axios.post(
            'https://cipc-apm-rs-dev.azure-api.net/enterprise/v1/information',
            { enterprise_number: enterpriseNumber },
            { headers: { 'Content-Type': 'application/json' } }
        );

        return response.data?.Enterprise || null;
    } catch (error) {
        console.error('Error searching enterprise:', error.message);
        throw error;
    }
};

module.exports = { fetchCompanyData, searchEnterprise };