const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
// const { verifyToken } = require('../middlewares/authMiddleware');


// Middleware function to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token is required' });
    }
  
    try {
      const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); // Extract token from "Bearer <token>"
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
  };

const {
    createStaff,
    editStaff,
    deleteStaff,
    getAllStaff,
    getStaffById
} = require('../controllers/hostelStaff.controller');

// Routes
router.post('/create', verifyToken, createStaff);
router.put('/editstaff/:id', verifyToken, editStaff);
router.delete('/deletestaff/:id', verifyToken, deleteStaff);
router.get('/allstaff', verifyToken, getAllStaff);
router.get('/staff:id', verifyToken, getStaffById);

module.exports = router;
