// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// // Define Hostel Membership Schema
// const hostelMembershipSchema = new Schema({
//   userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
//   userSize: { type: String, enum: ['1-250', '250-500+'], required: true }, // Hostel size category
//   plan: { 
//     type: String,
//     enum: ['monthly', 'yearly', 'free'],
//     required: true
//   },
//   paymentInfo: {
//     transactionId: { type: String },
//     lastPaymentAmount: { type: Number },
//     date: { type: Date },
//     description: { type: String, default: 'hostel crm payment' },
//     servicePeriod: { type: String }, // Format: "start date - end date"
//     paymentMethod: { type: String },
//     subtotal: { type: Number }, // Plan amount including taxes
//     total: { type: Number } // Same as subtotal
//   },
//   isActive: { type: Boolean, default: true }, // Membership status (active/suspended)
//   suspensionDate: { type: Date }, // Date when membership was suspended
//   suspensionNotificationSent: { type: Boolean, default: false } // Flag to track suspension notification status
// });

// // Middleware to handle the logic for setting servicePeriod and suspensionDate based on the selected plan
// hostelMembershipSchema.pre('save', function(next) {
//   const currentDate = new Date();
//   if (this.plan === 'monthly') {
//     const endDate = new Date(currentDate);
//     endDate.setDate(currentDate.getDate() + 30);
//     this.paymentInfo.servicePeriod = `${currentDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`;
//     this.suspensionDate = endDate; // Suspension date after 30 days for monthly plan
//   } else if (this.plan === 'yearly') {
//     const endDate = new Date(currentDate);
//     endDate.setDate(currentDate.getDate() + 365);
//     this.paymentInfo.servicePeriod = `${currentDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`;
//     this.suspensionDate = endDate; // Suspension date after 365 days for yearly plan
//   } else if (this.plan === 'free') {
//     const endDate = new Date(currentDate);
//     endDate.setDate(currentDate.getDate() + 60);
//     this.paymentInfo.servicePeriod = `${currentDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`;
//     this.suspensionDate = endDate; // Suspension date after 60 days for free plan
//   }
//   next();
// });

// // Compile model from schema
// const HostelMembership = mongoose.model('HostelMembership', hostelMembershipSchema);

// module.exports = HostelMembership;







// models/HostelMembership.js

// models/HostelMembership.js

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
    enum: ['1-250', '250-500+'],
    required: true
  },
  paymentPlan: {
    type: String,
    enum: ['yearly', 'monthly', 'free'],
    required: true
  },
  paymentInfo: {
    // Define payment information fields here
    // You may add fields like amount, paymentDate, etc.
  },
  suspensionDate: {
    type: Date
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

const HostelMembership = mongoose.model('HostelMembership', HostelMembershipSchema);

module.exports = HostelMembership;
