// const mongoose = require('mongoose');

// const hostelUserSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     userType: { type: String, enum: ['student', 'working emp', 'guest'], required: true },
//     name: { type: String, required: true },
//     fatherName: { type: String, required: true },
//     mobile: { type: String, required: true },
//     age: { type: Number, required: true },
//     referredBy: { type: String },
//     aadharNumber: { type: String, required: true },
//     purposeFor: { type: String }, 
//     uploadAadhar: { type: String }, // You may store the file path or reference to the uploaded file
//     addressProof: { type: String }, // You may store the file path or reference to the uploaded file
//     address: { type: String, required: true },
//     residenceCity: { type: String, required: true },
//     state: { type: String, required: true },
//     profilePhoto: { type: String }, // You may store the file path or reference to the uploaded file
//     referenceMobile: { type: String },
//     requireRoomType: { type: String, enum: ['shared', 'single'], required: true },
    
//         floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor' }, // Reference to Floor
//         room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // Reference to Room
//         bed: { type: Number }, // Bed number
    
//     billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
//     billingDate: { type: Date },
//     paymentType: { type: String, enum: ['advance', 'fullPayment'], required: true },
//     amount: { type: Number },
//     billingAmount: { type: Number },
//     endDate: { type: Date },
//     userReferenceId: { type: Number } // Add userReferenceId field

// });

// const HostelUser = mongoose.model('HostelUser', hostelUserSchema);
// module.exports = HostelUser;


const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
    billingDate: { type: Date, required: true },
    billingAmount: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    paymentStatus: { type: String, required: true },
    // You can add more fields as needed
});

const hostelUserSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userType: { type: String, enum: ['student', 'working emp', 'guest'], required: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    age: { type: Number, required: true },
    fatherName: { type: String, required: true },
    parentPhoneNumber:{type:Number,required:true},
    parentEmail:{type:String,required:true},
    referredBy: { type: String },
    aadharNumber: { type: String, required: true },
    purposeFor: { type: String }, 
    uploadAadhar: { type: String },
    addressProof: { type: String },
    address: { type: String, required: true },
    residenceCity: { type: String, required: true },
    state: { type: String, required: true },
    profilePhoto: { type: String },
    referenceMobile: { type: String },
    requireRoomType: { type: String, enum: ['shared', 'single'], required: true },
    floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor' },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    bed: { type: Number },
    billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
    billingDate: { type: Date },
    paymentType: { type: String, enum: ['advance', 'fullPayment'], required: true },
    amount: { type: Number },
    billingAmount: { type: Number },
    endDate: { type: Date },
    userReferenceId: { type: Number },
    pendingAmount:{type:Number},
    paymentHistory: [paymentHistorySchema] // Array field to store payment history objects
});

const HostelUser = mongoose.model('HostelUser', hostelUserSchema);
module.exports = HostelUser;
