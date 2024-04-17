// incomeRecord.js

const mongoose = require('mongoose');

const incomeRecordSchema = new mongoose.Schema({
    totalIncome: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const IncomeRecord = mongoose.model('IncomeRecord', incomeRecordSchema);
