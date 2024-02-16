// const mongoose = require('mongoose');

const mongoose = require('mongoose');

const hostelStaffSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
    username: {
        type: String,
        required: true,
        unique: true
    },
    aadharNumber: {
        type: Number,
        required: true,
        unique: true
    }, 
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    
    joiningDate: {
        type: Date,
        required: true
    },
    
    salaryDate: {
        type: Date,
        required: true
    },
    salaryAmount: {
        type: Number,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
	
    country: {
        type: String,
        required: true
    },
	
    state: {
        type: String,
        required: true
    },
	
    city: {
        type: String,
        required: true
    },
    // attachment: {
    //     type: Buffer, // Assuming attachment will be stored as binary data
    //     required: true
    // },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Staff = mongoose.model('Staff', hostelStaffSchema);

module.exports = Staff;




