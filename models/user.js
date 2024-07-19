


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    hostelName: { type: String, required: true },
    email: { type: String, required: true },
    gender:{type:String, enum:["male","female"],default:'male'}, 
    password: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    aadharNumber: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    userSize: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'hold', 'suspended'], default: 'pending' } 
});

module.exports = mongoose.model('User', userSchema);



