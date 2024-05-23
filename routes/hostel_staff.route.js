const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createStaff, editStaff, deleteStaff, getAllStaff, getStaffById } = require('../controllers/hostelstaff.controller');

// Middleware function to verify JWT token and attach userId to the request object
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token is required' });
  }

  try {
    // Verify the JWT token and extract the user ID
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); 
    req.userId = decoded.id; // Attach userId to the request object
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Routes

// Route to create a new staff member
router.post('/createstaff', verifyToken, createStaff);

// Route to edit a staff member
router.put('/editstaff/:id', verifyToken, editStaff);

// Route to delete a staff member
router.delete('/deletestaff/:id', verifyToken, deleteStaff);

// Route to get all staff members
router.get('/getallstaff', verifyToken, getAllStaff);

// Route to get a specific staff member by ID
router.get('/getstaff/:id', verifyToken, getStaffById);

module.exports = router;
