const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getAllHostelUsers, createHostelUser, getHostelUserById, updateHostelUserById, deleteHostelUserById , getAllStudentHostelUsers,
  getAllWorkingEmployeeHostelUsers,
  getAllGuestHostelUsers} = require('../controllers/hostelUsers.controller');

// Middleware function to verify JWT token
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

router.get('/hostelalluser', verifyToken, getAllHostelUsers);
router.post('/createhosteluser', verifyToken, createHostelUser);
router.get('/hosteluser/:id', verifyToken, getHostelUserById);
router.put('/hosteluser/:id', verifyToken, updateHostelUserById);
router.delete('/hosteluser/:id', verifyToken, deleteHostelUserById);

// GET all student hostel users
router.get('/students',verifyToken, getAllStudentHostelUsers);

// GET all working employee hostel users
router.get('/working-emp',verifyToken, getAllWorkingEmployeeHostelUsers);

// GET all guest hostel users
router.get('/guests',verifyToken, getAllGuestHostelUsers);

module.exports = router;
