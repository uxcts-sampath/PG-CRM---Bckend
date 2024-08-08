const express = require('express');
const router = express.Router();
const Floor = require('../models/floor');
const jwt = require('jsonwebtoken');
const Room=require('../models/rooms')

const {pgfloor,getAllFloors,deleteFloor}=require("../controllers/floor.controller")

// Middleware function to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); 
    console.log("Decoded JWT:", decoded); // Debugging
    req.userId = decoded.id; // Attach userId to the request object
    console.log("User ID attached to request:", req.userId); // Debugging
    next();
  } catch (error) {
    console.error("JWT verification error:", error); // Debugging
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// POST endpoint to create a new floor
router.post('/floor', verifyToken, async (req, res) => {
  try {
    const { userId } = req; // Access userId from the request object

    const existingFloor = await Floor.findOne({
      floorNumber: req.body.floorNumber,
      userId: userId
    });

    if (existingFloor) {
      return res.status(400).json({ success: false, message: 'Floor number already exists for this user' });
    }

    req.body.userId = userId; // Ensure userId is attached to the floor object
    const newFloor = await Floor.create(req.body);
    res.json(newFloor);
  } catch (error) {
    console.error('Error creating floor:', error);
    res.status(500).json({ success: false, message: 'Error creating floor' });
  }
});










// router.get('/floors', verifyToken, async (req, res) => {
//   try {
//     const { userId } = req;
//     let floors = await Floor.find({ userId }).populate({
//       path: 'rooms',
//       populate: {
//         path: 'beds'
//       }
//     });
    
//     floors = floors.map(floor => {
//       const floorObject = floor.toObject();
      
//       // Initialize counters for each floor
//       floorObject.totalRooms = floorObject.rooms.length;
//       floorObject.totalBeds = 0;
//       floorObject.occupiedBeds = 0;
//       floorObject.availableBeds = 0; // Initialize available beds counter
      
//       // Iterate over each room to count total beds, occupied beds, and available beds
//       floorObject.rooms.forEach(room => {
//         floorObject.totalBeds += room.beds.length; // Assuming each room document has a 'beds' array
        
//         // Counting occupied beds based on the status 'occupied'
//         const occupiedBedsCount = room.beds.filter(bed => bed.status === 'occupied').length;
//         floorObject.occupiedBeds += occupiedBedsCount;

//         // Counting available beds based on the status 'available'
//         const availableBedsCount = room.beds.filter(bed => bed.status === 'available').length;
//         floorObject.availableBeds += availableBedsCount;
//       });
      
//       return floorObject;
//     });

//     res.json(floors);
//     console.log(floors)
//   } catch (error) {
//     console.error('Error fetching floors:', error);
//     res.status(500).json({ success: false, message: 'Error fetching floors' });
//   }
// });











router.get('/floors', verifyToken, async (req, res) => {
  try {
    const { userId } = req;
    let floors = await Floor.find({ userId }).populate({
      path: 'rooms',
      populate: {
        path: 'beds'
      }
    });
    
    floors = floors.map(floor => {
      const floorObject = floor.toObject();
      
      // Initialize counters for each floor
      floorObject.totalRooms = floorObject.rooms ? floorObject.rooms.length : 0;
      floorObject.totalBeds = 0;
      floorObject.occupiedBeds = 0;
      floorObject.availableBeds = 0; // Initialize available beds counter
      
      // Iterate over each room to count total beds, occupied beds, and available beds
      if (floorObject.rooms) {
        floorObject.rooms.forEach(room => {
          floorObject.totalBeds += room.beds ? room.beds.length : 0; // Assuming each room document has a 'beds' array
          
          // Counting occupied beds based on the status 'occupied'
          const occupiedBedsCount = room.beds ? room.beds.filter(bed => bed.status === 'occupied').length : 0;
          floorObject.occupiedBeds += occupiedBedsCount;

          // Counting available beds based on the status 'available'
          const availableBedsCount = room.beds ? room.beds.filter(bed => bed.status === 'available').length : 0;
          floorObject.availableBeds += availableBedsCount;
        });
      }

      return floorObject;
    });

    // Initialize counters for total rooms and beds
    let totalRooms = 0;
    let totalBeds = 0;
    let occupiedBeds = 0;
    let availableBeds = 0;

    // Iterate over each floor to aggregate data
    floors.forEach(floor => {
      totalRooms += floor.totalRooms;
      totalBeds += floor.totalBeds;
      occupiedBeds += floor.occupiedBeds;
      availableBeds += floor.availableBeds;
    });

    const responseData = {
      totalFloors: floors.length,
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      floors // Add the modified floors array with calculated fields
    };

    // Insert the responseData into an array
    const dataArray = [responseData];

    res.json(dataArray);
    console.log(dataArray);
  } catch (error) {
    console.error('Error fetching floors:', error);
    res.status(500).json({ success: false, message: 'Error fetching floors' });
  }
});










router.delete('/floors/:floorId', async (req, res) => {
  const { floorId } = req.params;

  try {
    // Check if the floor has any associated rooms
    const roomsCount = await Room.countDocuments({ floor: floorId });
    if (roomsCount > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete floor with associated rooms Please delete room' });
    }

    // If there are no associated rooms, proceed with deleting the floor
    await Floor.findByIdAndDelete(floorId);

    res.json({ success: true, message: 'Floor deleted successfully' });
  } catch (error) {
    console.error('Error deleting floor:', error);
    res.status(500).json({ success: false, message: 'Error deleting floor' });
  }
});




module.exports = router;




