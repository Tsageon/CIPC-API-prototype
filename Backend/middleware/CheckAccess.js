const tierFeatures = {
    basic: {
        legalTemplates: "standard",
        businessAdvice: true,
        complianceTools: false,
        agentCommissions: false,
        certifications: "none",
    },
    professional: {
        legalTemplates: "standard",
        businessAdvice: true,
        complianceTools: true,
        agentCommissions: true,
        certifications: "limited",
    },
    enterprise: {
        legalTemplates: "advanced",
        businessAdvice: true,
        complianceTools: true,
        agentCommissions: true,
        certifications: "unlimited",
    },
};

const checkFeature = (feature) => (req, res, next) => {
    const company = req.company;

    if (!company || !company.subscription || !tierFeatures[company.subscription.tier]) {
        return res.status(403).json({ message: "Subscription tier is invalid or not found." });
    }

    const isFeatureAvailable = tierFeatures[company.subscription.tier][feature];

    if (!isFeatureAvailable) {
        return res.status(403).json({
            message: `Feature "${feature}" is not available for your subscription tier.`,
        });
    }

    next();
};

module.exports = checkFeature;