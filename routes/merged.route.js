// const express = require('express');
// const router = express.Router();
// const Floor = require('../models/floor');
// const Room = require('../models/rooms');
// const jwt = require('jsonwebtoken');




// // Middleware function to verify JWT token
// const verifyToken = (req, res, next) => {
//     const token = req.headers.authorization;
//     if (!token) {
//       return res.status(401).json({ success: false, message: 'Token is required' });
//     }
  
//     try {
//       const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); // Extract token from "Bearer <token>"
//       req.user = decoded;
//       next();
//     } catch (error) {
//       return res.status(403).json({ success: false, message: 'Invalid token' });
//     }
//   };



// router.get('/mergedData', verifyToken, async (req, res) => {
//     const { userId } = req;
//     const {floorId}=req;
//     // console.log(userId)
    
//     try {
//         // Fetch floors associated with the userId and populate rooms
//         const floors = await Floor.find({ userId });
        
//         // Fetch rooms associated with the userId
//         const rooms = await Room.find({ floor_id: floorId });

//         // Merge the data
//         const mergedData = { floors, rooms };

//         // Send the response
//         res.json(mergedData);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });



// router.get('/getfloors', verifyToken, async (req, res) => { 
//   try {
//     const { userId } = req; // Access userId from the request object
//     const getfloors = await Floor.find({ user: userId }); // Find floors belonging to the user
//     res.json(getfloors);
//   } catch (error) {
//     console.error('Error fetching floors:', error);
//     res.status(500).json({ success: false, message: 'Error fetching floors' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const Floor = require('../models/floor');
const jwt = require('jsonwebtoken');
const Room = require('../models/rooms');

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


router.get('/mergedData', verifyToken, async (req, res) => {
  const { userId } = req;
  const {floorId}=req;
  // console.log(userId)
  
  try {
      // Fetch floors associated with the userId and populate rooms
      const floor = await Floor.find({ userId });
      
      // Fetch rooms associated with the userId
      const rooms = await Room.find({ floor_id: floorId });

      // Merge the data
      const mergedData = { floor, rooms };

      // Send the response
      res.json(mergedData);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// GET endpoint to fetch floors with associated rooms and beds for a specific user



module.exports = router;
