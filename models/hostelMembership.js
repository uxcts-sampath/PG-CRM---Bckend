const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HostelMembershipSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userSize: {
    type: String,
    enum: ['1-250', '251-500+'],
    required: true
  },
  paymentPlan: {
    type: String,
    enum: ['yearly', 'monthly', 'free'],
    required: true 
  },
  paymentInfo: {
    transactionId: {
      type: String,
      default: function() {
        return this.paymentPlan === 'free' ? null : undefined; // Set transactionId to null if payment plan is 'free'
      }
    },
    amount: {
      type: Number,
      default: function() {
        return this.paymentPlan === 'free' ? 0 : undefined; // Set amount to 0 if payment plan is 'free'
      }
    },
    paymentType: {
      type: String,
      default: function() {
        if (this.paymentPlan === 'monthly') {
          return 'monthly';
        } else if (this.paymentPlan === 'yearly') {
          return 'yearly';
        } else if (this.paymentPlan === 'free') {
          return 'free';
        } else {
          return undefined;
        }
      }
    }
  },
  suspensionDate: {
    type: Date,
    default: function() {
      let suspensionDays;
      switch (this.paymentPlan) {
        case 'monthly':
          suspensionDays = 30;
          break;
        case 'yearly':
          suspensionDays = 365;
          break;
        case 'free':
          suspensionDays = 60;
          break;
        default:
          suspensionDays = 0;
      }
      return new Date(Date.now() + suspensionDays * 24 * 60 * 60 * 1000);
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Define a virtual property for servicePeriod based on paymentPlan
HostelMembershipSchema.virtual('servicePeriod').get(function() {
  switch (this.paymentPlan) {
    case 'monthly':
      return '1 month';
    case 'yearly':
      return '1 year';
    case 'free':
      return '2 months'; // Example, adjust as per your requirement
    default:
      return 'N/A';
  }
});

const HostelMembership = mongoose.model('HostelMembership', HostelMembershipSchema);

module.exports = HostelMembership;
