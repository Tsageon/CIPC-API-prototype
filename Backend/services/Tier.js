const router = require("../controllers/Paypal");

const subscriptionFeatures = {
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


module.exports = router;