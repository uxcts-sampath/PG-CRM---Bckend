// routes/upcomingFeeRoutes.js
const express = require('express');
const router = express.Router();
const upcomingFeeController = require('../controllers/upcomingFeeController');

// Route for getting upcoming fee list
router.get('/', upcomingFeeController.getUpcomingFeeList);

module.exports = router;
