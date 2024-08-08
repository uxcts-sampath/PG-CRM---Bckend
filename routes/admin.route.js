const express = require('express');
const router = express.Router();
const { registerAdmin, login,getAdminProfile,}=require('../controllers/admin.controller')





// Register a new admin
router.post('/registeradmin', registerAdmin);

// Admin login
router.post('/login', login);

// Get admin profile
router.get('/profileadmin', getAdminProfile);

module.exports = router;