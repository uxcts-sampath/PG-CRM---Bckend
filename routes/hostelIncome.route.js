const express = require('express');
const router = express.Router();
const hostelIncomeController = require('../controllers/hostelIncomeController');

// Get all hostel incomes
router.get('/pgincome', hostelIncomeController.getAllHostelIncomes);

// Get hostel income by ID
router.get('/pgincome/:id', hostelIncomeController.getHostelIncomeById);

// Create a new hostel income
router.post('/pgincome', hostelIncomeController.createHostelIncome);

// Update a hostel income by ID
router.put('/pgincome/:id', hostelIncomeController.updateHostelIncomeById);

// Delete a hostel income by ID
router.delete('/pgincome/:id', hostelIncomeController.deleteHostelIncomeById);

module.exports = router;
