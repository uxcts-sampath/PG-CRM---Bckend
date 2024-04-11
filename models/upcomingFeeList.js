// models/upcomingFee.js
const mongoose = require('mongoose');

const upcomingFeeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'HostelUser', required: true },
    endDate: { type: Date, required: true },
    fullPaymentAmount: { type: Number, default: 0 }, // Amount paid in full
    advancePaymentAmount: { type: Number, default: 0 }, // Amount paid in advance
    pendingAmount: { type: Number, default: 0 }, // Pending amount
});

const UpcomingFee = mongoose.model('UpcomingFee', upcomingFeeSchema);
module.exports = UpcomingFee;
