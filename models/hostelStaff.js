const mongoose = require('mongoose');

const hostelStaffSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    staffType: { type: String, enum: [
        'Manager',
'reception',
'chief warden',
'warden boys',
'warden girls',
'care taker',
'employee',
'House keeping',
'Sales & Marketing',
'cook',
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
    previouslyWorkedAt: { type: String },
    uploadAadhar: { type: String }, // You may store the file path or reference to the uploaded file
    addressProof: { type: String }, // You may store the file path or reference to the uploaded file
    address: { type: String, required: true },
    residenceCity: { type: String, required: true },
    state: { type: String, required: true },
    profilePhoto: { type: String }, // You may store the file path or reference to the uploaded file
    referenceMobile: { type: String },
    billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
    billingDate: { type: Date },
    amount: { type: Number } // Auto-generated amount based on selected options
});

const HostelStaff = mongoose.model('HostelStaff', hostelStaffSchema);
module.exports = HostelStaff;
