
const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
    billingDate: { type: Date, required: true },
    payment:{type:String,enum:['cash','online'],required:true},
    outstanding:{type:Number},
    subTotal:{ type: Number },
    customAmount:{ type: Number },
    total:{type:Number},
    amountPaid: { type: Number },
    // pendingAmount:{type:Number}
});

const hostelUserSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userType: { type: String, enum: ['student', 'working emp', 'guest'], required: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    age: { type: Number, required: true },
    fatherName: { type: String, required: true },
    parentPhoneNumber:{type:Number,required:true},
    parentEmail:{type:String},
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
    paymentHistory: [paymentHistorySchema] // Array field to store payment history objects
});

const HostelUser = mongoose.model('HostelUser', hostelUserSchema);
module.exports = HostelUser; 
