const Company = require('../models/Company'); 


const checkSubscription = (requiredPlans = []) => async (req, res, next) => {
    try {
        const companyId = req.user.companyId; 
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        if (company.subscription.status !== 'active') {
            return res.status(403).json({ error: "Your subscription is not active. Please complete payment to access this feature." });
        }

        if (requiredPlans.length > 0 && !requiredPlans.includes(company.subscription.plan)) {
            return res.status(403).json({ error: `Your subscription plan (${company.subscription.plan}) does not have access to this feature. Please upgrade your plan.` });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error while checking subscription" });
    }
};

module.exports = checkSubscription;