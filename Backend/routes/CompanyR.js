const express = require('express');
const CompanyController = require('../controllers/CompanyC')
const checkSubscription = require('../middleware/CheckAccess');
const attachCompany = require('../middleware/AttachCompany');
const router = express.Router();

router.use(attachCompany)

router.get('/getCompanies', CompanyController.getAllCompanies);
router.get('/search', checkSubscription(['basic', 'professional', 'enterprise']), CompanyController.searchCompany);
router.get("/legal-templates", checkSubscription("legalTemplates"), (req, res) => {
    const { subscription } = req.company;
    res.json({
        message: `You have access to ${tierFeatures[subscription.plan].legalTemplates} legal templates.`,
    });
});

router.get("/business-advice", checkSubscription("businessAdvice"), (req, res) => {
    res.json({ message: "You have access to business advice." });
});

router.get("/compliance-tools", checkSubscription("complianceTools"), (req, res) => {
    res.json({ message: "You have access to compliance tools." });
});

router.get("/agent-commissions", checkSubscription("agentCommissions"), (req, res) => {
    res.json({ message: "You have access to agent commissions." });
});

router.get("/certifications", checkSubscription("certifications"), (req, res) => {
    const { subscription } = req.company;
    res.json({
        message: `You have access to ${tierFeatures[subscription.plan].certifications} certifications.`,
    });
});

router.post('/register', CompanyController.registerCompany);
router.put('/:id', checkSubscription(['professional', 'enterprise']), CompanyController.updateCompany);
router.delete('/deleteCompany', checkSubscription(['professional', 'enterprise']), CompanyController.deleteCompany);

module.exports = router;