const express = require('express');
const CompanyController = require('../controllers/CompanyC')
const checkSubscription = require('../middleware/CheckAccess');
const attachCompany = require('../middleware/AttachCompany');
const router = express.Router();

router.get('/getCompanies', CompanyController.getAllCompanies);
router.get('/search', attachCompany, checkSubscription(['basic', 'professional', 'enterprise']), CompanyController.searchCompany);
router.get("/legal-templates", attachCompany, checkSubscription("legalTemplates"), (req, res) => {
    const { subscription } = req.company;
    res.json({
        message: `You have access to ${tierFeatures[subscription.plan].legalTemplates} legal templates.`,
    });
});

router.get("/business-advice", attachCompany, checkSubscription("businessAdvice"), (req, res) => {
    res.json({ message: "You have access to business advice." });
});

router.get("/compliance-tools", attachCompany, checkSubscription("complianceTools"), (req, res) => {
    res.json({ message: "You have access to compliance tools." });
});

router.get("/agent-commissions", attachCompany, checkSubscription("agentCommissions"), (req, res) => {
    res.json({ message: "You have access to agent commissions." });
});

router.get("/certifications", attachCompany, checkSubscription("certifications"), (req, res) => {
    const { subscription } = req.company;
    res.json({
        message: `You have access to ${tierFeatures[subscription.plan].certifications} certifications.`,
    });
});

router.post('/register', CompanyController.registerCompany);
router.put('/:id', checkSubscription(['professional', 'enterprise']), CompanyController.updateCompany);
router.delete('/deleteCompany', checkSubscription(['professional', 'enterprise']), CompanyController.deleteCompany);

module.exports = router;