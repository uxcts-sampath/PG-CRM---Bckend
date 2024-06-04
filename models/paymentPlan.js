const mongoose = require('mongoose');

const paymentPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userSize: { type: String, required: true },
  paymentPlan: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true },
});

const PaymentPlan = mongoose.model('PaymentPlan', paymentPlanSchema);

module.exports = PaymentPlan;
