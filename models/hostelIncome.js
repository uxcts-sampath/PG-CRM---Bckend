const mongoose = require('mongoose');

const hostelIncomeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Auth token user id
    depositType: { type: String, enum: ['students', 'working employee', 'guest', 'PG ID'], required: true },
    amount: { type: Number, required: true },
    payThrough: { type: String, enum: ['deposit', 'advance', 'monthly', 'food'], required: true },
    paymentMode: { type: String, enum: ['cash', 'UPI', 'QR', 'Card'], required: true },
    totalAmount: { type: Number, required: true },
    dueAmount: { type: Number, required: true }
});

const HostelIncome = mongoose.model('HostelIncome', hostelIncomeSchema);
module.exports = HostelIncome;