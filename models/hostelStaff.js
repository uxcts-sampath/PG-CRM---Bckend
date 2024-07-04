const mongoose = require('mongoose');

const hostelStaffSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    staffType: { type: String, enum: [
        'Manager',
        'Reception',
        'Chief Warden',
        'Warden Boys',
        'Warden Girls',
        'Care Taker',
        'Employee',
        'House Keeping',
        'Sales & Marketing',
        'Cook',
        'Helper',
        'Gardner',
        'Security'
      ], required: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    mobile: { type: String, required: true },
    age: { type: Number, required: true },
    referredBy: { type: String },
    aadharNumber: { type: String, required: true },
    shifts: {
        type: String,
        enum: ['Day', 'Night', 'Full Day'],
        required: true
      },
    previouslyWorkedAt: { type: String },
    uploadAadhar: { type: String }, 
    addressProof: { type: String }, 
    address: { type: String, required: true },
    residenceCity: { type: String, required: true },
    state: { type: String, required: true },
    profilePhoto: { type: String }, 
    referenceMobile: { type: String },
    billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
    billingDate: { type: Date },
    amount: { type: Number } ,
    status: {
      type: String,
      required: true,
      default: 'pending'
  },
});

const HostelStaff = mongoose.model('HostelStaff', hostelStaffSchema);
module.exports = HostelStaff; 
