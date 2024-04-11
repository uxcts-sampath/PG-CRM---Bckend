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
    req.userId = decoded.id; // Attach userId to the request object
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// POST endpoint to create a new floor
router.post('/floor', verifyToken, async (req, res) => {
  try {
    const { userId } = req; // Access userId from the request object
    req.body.user = userId; // Attach userId to the floor object
    const newFloor = await Floor.create(req.body);
    res.json(newFloor);
  } catch (error) {
    console.error('Error creating floor:', error);
    res.status(500).json({ success: false, message: 'Error creating floor' });
  }
});




// router.get('/floors', verifyToken, async (req, res) => { 
//   try {
//     const { userId } = req; // Access userId from the request object
//     const floors = await Floor.find({ userId }).populate('rooms'); // Populate the rooms array with actual room data
//     res.json(floors);
//   } catch (error) {
//     console.error('Error fetching floors:', error);
//     res.status(500).json({ success: false, message: 'Error fetching floors' });
//   }
// });


// router.get('/floors', verifyToken, async (req, res) => {
//   try {
//     const { userId } = req; // Access userId from the request object
//     let floors = await Floor.find({ userId }).populate('rooms'); // Populate the rooms array with actual room data
    
//     // Convert Mongoose documents to objects to be able to add new properties
//     floors = floors.map(floor => {
//       const floorObject = floor.toObject();
//       // Add totalRooms property which is the length of the populated rooms array
//       floorObject.totalRooms = floorObject.rooms.length;
//       return floorObject;
//     });

//     res.json(floors);
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
      floorObject.totalRooms = floorObject.rooms.length;
      floorObject.totalBeds = 0;
      floorObject.occupiedBeds = 0;
      floorObject.availableBeds = 0; // Initialize available beds counter
      
      // Iterate over each room to count total beds, occupied beds, and available beds
      floorObject.rooms.forEach(room => {
        floorObject.totalBeds += room.beds.length; // Assuming each room document has a 'beds' array
        
        // Counting occupied beds based on the status 'occupied'
        const occupiedBedsCount = room.beds.filter(bed => bed.status === 'occupied').length;
        floorObject.occupiedBeds += occupiedBedsCount;

        // Counting available beds based on the status 'available'
        const availableBedsCount = room.beds.filter(bed => bed.status === 'available').length;
        floorObject.availableBeds += availableBedsCount;
      });
      
      return floorObject;
    });

    res.json(floors);
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




