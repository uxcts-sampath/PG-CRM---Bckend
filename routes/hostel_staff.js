const express = require('express');
const { pgstaff, getAllstaff } = require('../controllers/hostelstaff.controller')
const router = express.Router();

router.post('/pgstaff', pgstaff );
router.get('/getstaff', getAllstaff );



module.exports = router; 