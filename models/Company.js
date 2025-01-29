const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    enterprise_number: {
        type: String,
        required: true,
        unique: true,
    },
    enterprise_type_description: {
        type: String,
        required: true,
    },
    sic_description: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    registration_date: {
        type: Date,
        required: true,
    },
    annualReturnDate: {
        type: Date,
        required: true,
    },
    tax_number: {
        type: String,
        required: true,
        unique: true,
    },
},
 { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
