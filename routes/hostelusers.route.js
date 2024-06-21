const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getAllHostelUsers, createHostelUser, getHostelUserById, updateHostelUserById, deleteHostelUserById, getAllStudentHostelUsers,
  getAllWorkingEmployeeHostelUsers,
  getAllGuestHostelUsers,processPayment,getPaymentDetails,renderCreateFormWithAvailableBeds} = require('../controllers/hostelUsers.controller');

  const multer = require('multer');


  // Multer configuration (if not already configured globally)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './public/images');
  },
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });





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


// router.post('/createhosteluser', verifyToken, (req, res) => createHostelUser(req, res, req.userId));

router.get('/hostelalluser', verifyToken, (req, res) => getAllHostelUsers(req, res, req.userId));
router.post('/createhosteluser', verifyToken,upload.single('profilePhoto'), (req, res) => createHostelUser(req, res, req.userId));
router.get('/hosteluser/:id', verifyToken, (req, res) => getHostelUserById(req, res, req.params.userId, req.params.id));
router.put('/updatehosteluser/:id', verifyToken, (req, res) => updateHostelUserById(req, res, req.userId, req.params.id));
router.delete('/hosteluser/:id', verifyToken, deleteHostelUserById);

// GET all student hostel users
router.get('/students', verifyToken, (req, res) => getAllStudentHostelUsers(req, res, req.params.userId));

// GET all working employee hostel users
router.get('/working-emp', verifyToken, (req, res) => getAllWorkingEmployeeHostelUsers(req, res, req.params.userId));

// GET all guest hostel users
router.get('/guests', verifyToken, (req, res) => getAllGuestHostelUsers(req, res, req.params.userId));

// router.get('/create', verifyToken, renderCreateFormWithAvailableBeds);

router.post('/processPayment',verifyToken, processPayment);

// Add a new GET endpoint to retrieve payment details for a hostel user
router.get('/paymentdetails/:userReferenceId', verifyToken, getPaymentDetails);



module.exports = router;
 