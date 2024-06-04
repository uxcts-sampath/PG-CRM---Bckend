
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { selectPaymentPlan, getUserPaymentPlan } = require('../controllers/paymentPlan.controller');


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

router.post('/paymentPlan', verifyToken, selectPaymentPlan);

router.get('/userPaymentPlan', verifyToken, getUserPaymentPlan);

module.exports = router;
