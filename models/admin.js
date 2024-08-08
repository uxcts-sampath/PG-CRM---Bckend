const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true, // changed 'require' to 'required'
  },
  phoneNumber: {
    type: Number,
    required: true, // changed 'require' to 'required'
  },
  email: {
    type: String,
    required: true, // changed 'require' to 'required'
    unique: true, // Ensure unique email addresses
    match: /.+\@.+\..+/, // Basic email validation regex
  },
  password: {
    type: String,
    required: true, // changed 'require' to 'required'
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
