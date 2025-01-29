const express = require('express');
const CompanyController = require('../controllers/CompanyC')
const router = express.Router();

router.get('/getCompanies', CompanyController.getAllCompanies);
router.get('/search', CompanyController.searchCompany);
router.post('/register', CompanyController.registerCompany);
router.put('/:id', CompanyController.updateCompany);
router.delete('/deleteCompany', CompanyController.deleteCompany);

module.exports = router;