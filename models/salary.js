const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HostelStaff',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    payableAmount: {
        type: Number,
        required: true
    },
    outstandingAmount: {
        type: Number,
        default: 0 
    },
    modeofPayment: {
        type: String,
        enum: ['cash', 'online'],
        required: true
    },
    subTotal: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    customAmount: {
        type: Number
    }
});

const Salary = mongoose.model('Salary', salarySchema);

module.exports = Salary;
