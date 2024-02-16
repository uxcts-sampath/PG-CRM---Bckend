const mongoose = require('mongoose');

const hostelExpensesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Auth token user id
    expensesType: { type: String, enum: ['Salary', 'Voucher Pay', 'Bill Payment'], required: true },
    paymentFor: { type: String, required: true },
    paymentType: { type: String, enum: ['Cash', 'Cheque', 'UPI', 'QR', 'Card'], required: true },
    paymentAmount: { type: Number, required: true },
    payeeName: { type: String }
});

const HostelExpenses = mongoose.model('HostelExpenses', hostelExpensesSchema);
module.exports = HostelExpenses;
