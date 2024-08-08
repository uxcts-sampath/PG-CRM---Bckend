const Admin = require('../models/admin'); // Adjust the path if necessary
const User = require('../models/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerAdmin = async (req, res) => {
    const { fullName, phoneNumber, email, password } = req.body;
  
    try {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newAdmin = new Admin({
        fullName,
        phoneNumber,
        email,
        password: hashedPassword,
        isAdmin: true, // Set to true for admin
      });
  
      await newAdmin.save();
  
      const token = jwt.sign({ id: newAdmin._id, isAdmin: newAdmin.isAdmin }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.status(201).json({ token, admin: newAdmin, message: 'Admin registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  
//   const login = async (req, res) => {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//         return res.status(400).json({ success: false, message: 'Email and password are required' });
//     }

//     try {
//         let user;
//         let userType;

//         // Check if the user is an admin
//         user = await Admin.findOne({ email });
//         if (user) {
//             userType = 'admin';
//         } else {
//             // Check if the user is a regular user
//             user = await User.findOne({ email });
//             if (user) {
//                 userType = 'user';
//             }
//         }

//         // If user is found, check password
//         if (user) {
//             const isMatch = await bcrypt.compare(password, user.password);
//             if (!isMatch) {
//                 return res.status(400).json({ success: false, message: 'Invalid credentials' });
//             }

//             // Generate JWT token
//             const token = jwt.sign({ id: user._id, userType }, process.env.JWT_SECRET, { expiresIn: '1h' });

//             // Construct user details for the response
//             const userDetails = {
//                 id: user._id,
//                 email: user.email,
//                 // Add additional details if necessary
//             };

//             if (userType === 'user') {
//                 // If the user is a regular user, add more details
//                 Object.assign(userDetails, {
//                     fullName: user.fullName,
//                     gender: user.gender,
//                     hostelName: user.hostelName,
//                     aadharNumber: user.aadharNumber,
//                     dateOfBirth: user.dateOfBirth,
//                     phoneNumber: user.phoneNumber,
//                     address: user.address,
//                     country: user.country,
//                     state: user.state,
//                     city: user.city, 
//                     userSize: user.userSize,
//                     // Add any additional user-specific details here
//                 });
//             }

//             // Send response
//             return res.status(200).json({
//                 success: true,
//                 token,
//                 userType,
//                 message: 'Login successful',
//                 user: userDetails
//             });
//         }

//         // If no user is found
//         return res.status(404).json({ success: false, message: 'User not found' });

//     } catch (error) {
//         console.error("Login Error:", error);
//         res.status(500).json({ success: false, message: 'Server error', error: error.message });
//     }
// };




const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
      // Check if the user is an admin
      let user = await Admin.findOne({ email });
      let userType;

      if (user) {
          // Admin login
          userType = 'admin';
      } else {
          // Check if the user is a regular user
          user = await User.findOne({ email });
          if (user) {
              userType = 'user';
          } else {
              return res.status(404).json({ success: false, message: 'User not found' });
          }
      }

      // If user is found, check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      // Status checks for regular users only
      if (userType === 'user') {
          if (user.status === 'pending') {
              return res.status(403).json({ success: false, message: 'Your account is pending approval.' });
          }

          if (user.status === 'hold') {
              return res.status(403).json({ success: false, message: 'Your account is on hold. Please contact support.' });
          }

          if (user.status === 'suspended') {
              return res.status(403).json({ success: false, message: 'Your account is suspended.' });
          }
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id, userType }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Construct user details for the response
      const userDetails = {
          id: user._id,
          email: user.email,
          // Add additional details if necessary
      };

      if (userType === 'user') {
          // If the user is a regular user, add more details
          Object.assign(userDetails, {
              fullName: user.fullName,
              gender: user.gender,
              hostelName: user.hostelName,
              aadharNumber: user.aadharNumber,
              dateOfBirth: user.dateOfBirth,
              phoneNumber: user.phoneNumber,
              address: user.address,
              country: user.country,
              state: user.state,
              city: user.city,
              userSize: user.userSize,
              // Add any additional user-specific details here
          });
      }

      // Send response
      return res.status(200).json({
          success: true,
          token,
          userType,
          message: 'Login successful',
          user: userDetails
      });

  } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};





const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  registerAdmin,
  login,
  getAdminProfile,
};
