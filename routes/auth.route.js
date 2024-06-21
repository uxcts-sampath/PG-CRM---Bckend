const express = require('express');
const { signup, signin, logout, forgotpassword, resetpassword, resetPasswordPage,getUserDetails,checkEmailAvailability,updateUserStatus } = require('../controllers/auth.controller');
const router = express.Router();
const jwt = require('jsonwebtoken');


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

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/logout', logout);
router.post('/forgotpassword', forgotpassword);
router.post('/resetpassword', resetpassword);
router.get('/resetpassword/:userId/:token', resetPasswordPage); 
router.get('/user/:userId',verifyToken, getUserDetails);
router.post('/checkEmailAvailability', checkEmailAvailability);
router.post('/updatestatus', updateUserStatus); // Protected route for admin


module.exports = router;
