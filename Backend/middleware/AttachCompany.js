const Company = require('../models/Company'); 

const attachCompany = async (req, res, next) => {
    try {
        const companyId = req.body.companyId || req.query.companyId;
        if (!companyId) {
            return res.status(400).json({ message: "Company ID is required." });
        }

        const company = await Company.findById(companyId); 
        if (!company) {
            return res.status(404).json({ message: "Company not found." });
        }

        req.company = company;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching company data." });
    }
    next()
};

module.exports = attachCompany;