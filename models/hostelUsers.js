const mongoose = require('mongoose');

const hostelUserSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
    
        floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor' }, // Reference to Floor
        room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // Reference to Room
        bed: { type: Number }, // Bed number
    
    billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
    billingDate: { type: Date },
    amount: { type: Number } // Auto-generated amount based on selected options
});

const HostelUser = mongoose.model('HostelUser', hostelUserSchema);
module.exports = HostelUser;
