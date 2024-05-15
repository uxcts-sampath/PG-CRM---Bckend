const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    amountPaid: {
        type: Number,
        required: true
    },
    datePaid: {
        type: Date,
        required: true
    }
});

const hostelUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    paymentHistory: [paymentSchema]
});

const HostelUser = mongoose.model('HostelUser', hostelUserSchema);

module.exports = HostelUser;
