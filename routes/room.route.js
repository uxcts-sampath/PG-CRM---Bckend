const express = require('express');
const router = express.Router();
const Room = require('../models/rooms');
const jwt = require('jsonwebtoken');
const Floor = require('../models/floor');

// Middleware function to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); // Extract token from "Bearer <token>"
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// POST endpoint to create a new room
router.post('/room', verifyToken, async (req, res) => {
  try {
    const { floorId, roomData } = req.body; // Assuming you're passing floorId along with roomData
    const createdRooms = [];

    // Create a new Room document for each room data
    for (const data of roomData) {
      const { type, numberOfBeds } = data;
      if (type === 'single') {
        // For single rooms, set numberOfBeds to 1
        data.numberOfBeds = 1;
      }

      const beds = generateBeds(data.numberOfBeds);
      const room = new Room({ ...data, floor: floorId, beds }); // Assign the floorId to each room
      const createdRoom = await room.save(); // Save the room
      createdRooms.push(createdRoom); // Push the created room to the array
    }

    // Update the floor's rooms array with the IDs of the created rooms
    await Floor.findByIdAndUpdate(floorId, { $push: { rooms: { $each: createdRooms.map(room => room._id) } } });

    res.json(createdRooms); // Return the created rooms
  } catch (error) {
    console.error('Error creating rooms:', error);
    res.status(500).json({ success: false, message: 'Error creating rooms' });
  }

  function generateBeds(numberOfBeds) {
    const beds = [];
    for (let i = 1; i <= numberOfBeds; i++) {
      beds.push({ bedNumber: i, status: 'available' }); // Assuming all beds are initially available
    }
    return beds;
  }
});




router.delete('/room/:roomId', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params; // Get the roomId from the request parameters

    // Find the room by its ID and remove it
    const deletedRoom = await Room.findByIdAndDelete(roomId);
    if (!deletedRoom) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Find the floor that contains the room ID and remove it from the rooms array
    await Floor.updateOne({ rooms: roomId }, { $pull: { rooms: roomId } });

    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ success: false, message: 'Error deleting room' });
  }
});







// // GET endpoint to retrieve rooms based on floor ID
// router.get('/getrooms/:floorId', verifyToken, async (req, res) => {
//   try {
//     const rooms = await Room.find({ floor: req.params.floorId });
//     res.json(rooms);
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });



// GET endpoint to fetch rooms based on floorId
router.get('/rooms/:floorId', verifyToken, async (req, res) => {
  try {
    const { userId } = req; // Access userId from the request object
    const { floorId } = req.params; // Extract floorId from URL parameters

    // You might want to validate if the user has access to the specified floorId here

    // Find rooms belonging to the specified floorId and userId
    const rooms = await Room.find({ floor: floorId, user: userId });
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: 'Error fetching rooms' });
  }
});

router.delete('/rooms/floor/:floorId', async (req, res) => {
  const { floorId } = req.params;

  try {
    const userId = req.userId; // Assuming userId is available in request
    const floorId = req.params.floorId; // Assuming floorId is available in request parameters

    await deleteFloor(userId, floorId);

    res.json({ success: true, message: 'Floor and associated rooms deleted successfully' });
} catch (error) {
    console.error('Error deleting floor and associated rooms:', error);
    res.status(500).json({ success: false, message: 'Error deleting floor and associated rooms' });
}
});

module.exports = router;
