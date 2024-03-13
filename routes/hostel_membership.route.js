
// routes/hostelMembershipRoutes.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {createHostelMembership}  = require('../controllers/hostelMembership.controller');

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

// Define routes
router.post('/create',verifyToken, createHostelMembership);
// Define other routes for CRUD operations

module.exports = router;
