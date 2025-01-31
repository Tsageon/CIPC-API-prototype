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
    subscription: {
        plan: { type: String, enum: ['basic', 'professional', 'enterprise'], default: 'basic' },
        last_payment_date: { type: Date, default: Date.now },
        next_payment_due: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        status: { type: String, enum: ['active', 'inactive', 'overdue','pending'], default: 'pending' }
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
