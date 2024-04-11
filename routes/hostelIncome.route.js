const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getAllHostelIncomes, getHostelIncomeById, createHostelIncome, updateHostelIncomeById, deleteHostelIncomeById } = require('../controllers/hostelIncome.controller');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token is required' });
    }
  
    try {
      const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); 
      req.userId = decoded.id; // Attach userId to the request object
      next();
    } catch (error) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
  };

// Get all hostel incomes
router.get('/pgincome', verifyToken, getAllHostelIncomes);

// Get hostel income by ID
router.get('/pgincome/:id',verifyToken, getHostelIncomeById);

// Create a new hostel income
router.post('/pgincome',verifyToken, createHostelIncome);

// Update a hostel income by ID
router.put('/pgincome/:id',verifyToken, updateHostelIncomeById);

// Delete a hostel income by ID
router.delete('/pgincome/:id',verifyToken, deleteHostelIncomeById);

module.exports = router;
