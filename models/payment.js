const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    selectedDate: {
        type: Date,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    paymentPlan: {
        type: String,
        enum: ['yearly', 'monthly', 'free'],
        required: true
    },
    suspensionDate: {
        type: Date,
        required: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    nextPlanDate: {
        type: Date,
        required: true
    },
    
    subtotal: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    userSize: {
        type: String,
        // enum: ['1-250', '251-500+'],
        required: true
    }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
