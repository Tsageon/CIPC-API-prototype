const Company = require('../models/Company');

exports.registerCompany = async (req, res) => {
    try {
        const {
            enterprise_number,
            enterprise_type_description,
            sic_description,
            companyName,
            email,
            tax_number,
        } = req.body;

        let missingFields = [];

        if (!enterprise_number) missingFields.push("enterprise_number");
        if (!enterprise_type_description) missingFields.push("enterprise_type_description");
        if (!sic_description) missingFields.push("sic_description");
        if (!companyName) missingFields.push("companyName");
        if (!email) missingFields.push("email");
        if (!tax_number) missingFields.push("tax_number");

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `The following fields are required: ${missingFields.join(", ")}`
            });
        }

        if (!companyName || companyName.trim() === "") {
            return res.status(400).json({ error: "Company name is required and cannot be empty" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const existingCompany = await Company.findOne({ enterprise_number });
        if (existingCompany) {
            return res.status(400).json({ error: "Enterprise number already exists" });
        }

        const registrationDate = new Date();
        const annualReturnDate = new Date(registrationDate);
        annualReturnDate.setFullYear(annualReturnDate.getFullYear() + 1);

        const subscription = {
            plan: 'basic',  
            last_payment_date: Date.now(),
            next_payment_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Set default 30 days later
            status: 'pending', 
        };
    
        const company = new Company({
            enterprise_number,
            enterprise_type_description,
            sic_description,
            companyName,
            email,
            registration_date: registrationDate,
            annualReturnDate,
            tax_number,
            subscription,  
            status: "pending"
        });

        await company.save();
        res.status(201).json({ message: "Company registered successfully" });

    } catch (error) {
        console.error(error);

        if (error.name === "ValidationError") {
            return res.status(400).json({ error: "Invalid input data" });
        }

        if (error.code === 11000) {
            return res.status(400).json({ error: "Duplicate entry detected" });
        }

        res.status(500).json({ error: "Failed to register company due to an internal error" });
    }};



exports.getAllCompanies = async (res) => {
    try {
        const companies = await Company.find();

        const formattedCompanies = companies.map(company => ({
            ...company._doc,
            registration_date: new Date(company.registration_date).toLocaleString("en-US", { timeZone: "Africa/Johannesburg" }),
            annualReturnDate: new Date(company.annualReturnDate).toLocaleString("en-US", { timeZone: "Africa/Johannesburg" }),
        }));

        res.status(200).json(formattedCompanies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve companies" });
    }
};



exports.searchCompany = async (req, res) => {
    try {
        const { enterprise_number, id } = req.query;

        let query = {};

        if (enterprise_number) {
            query.enterprise_number = enterprise_number;
        }

        if (id) {
            query._id = id;
        }

        const companies = await Company.find(query);

        if (companies.length === 0) {
            return res.status(404).json({ message: "No company found" });
        }

        res.status(200).json(companies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to search for company" });
    }
};


exports.updateCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json(company);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to update company info' })
    }
}

exports.deleteCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete company' });
    }
}