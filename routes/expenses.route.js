const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createExpense, editExpense, deleteExpense, getAllExpenses, getExpenseById } = require('../controllers/expenses.controller');

// Middleware function to verify JWT token and attach userId to the request object
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

// Routes for expense management
router.post('/createexpense', verifyToken, createExpense); // Create a new expense
router.put('/:id', verifyToken, editExpense); // Edit an existing expense
router.delete('/:id', verifyToken, deleteExpense); // Delete an existing expense
router.get('/getexpenses', verifyToken, getAllExpenses);
// router.get('/:id', verifyToken, getExpenseById); 

module.exports = router;
