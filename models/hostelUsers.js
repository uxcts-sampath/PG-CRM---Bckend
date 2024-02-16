const mongoose = require('mongoose');

const hostelUserSchema = new mongoose.Schema({
    userType: { type: String, enum: ['student', 'working emp', 'guest'], required: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    mobile: { type: String, required: true },
    age: { type: Number, required: true },
    referredBy: { type: String },
    aadharNumber: { type: String, required: true },
    purposeFor: { type: String },
    uploadAadhar: { type: String }, // You may store the file path or reference to the uploaded file
    addressProof: { type: String }, // You may store the file path or reference to the uploaded file
    address: { type: String, required: true },
    residenceCity: { type: String, required: true },
    state: { type: String, required: true },
    profilePhoto: { type: String }, // You may store the file path or reference to the uploaded file
    referenceMobile: { type: String },
    requireRoomType: { type: String, enum: ['shared', 'single'], required: true },
    allotRoom: {
        floor: { type: Number, default: 1 }, // Default floor value is 1
        room: { type: String, default: 'A101' } // Default room value is 'A101'
    },
    billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
    billingDate: { type: Date },
    amount: { type: Number } // Auto-generated amount based on selected options
});

const HostelUser = mongoose.model('HostelUser', hostelUserSchema);
module.exports = HostelUser;
