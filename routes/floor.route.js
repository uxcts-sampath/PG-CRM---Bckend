const express = require('express');
const router = express.Router();
const Floor = require('../models/floor');
const jwt = require('jsonwebtoken');



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



// GET endpoint to fetch floors for a specific user with populated rooms
router.get('/floors', verifyToken, async (req, res) => { 
  try {
    const { userId } = req; // Access userId from the request object
    const floors = await Floor.find({ userId }).populate('rooms'); // Populate the rooms array with actual room data
    res.json(floors);
  } catch (error) {
    console.error('Error fetching floors:', error);
    res.status(500).json({ success: false, message: 'Error fetching floors' });
  }
});

router.delete('/floor/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params; // Extract the floor ID from the request parameters

    // Find the floor by ID
    const floor = await Floor.findById(id);

    if (!floor) {
      return res.status(404).json({ success: false, message: 'Floor not found' });
    }

    // Delete rooms associated with the floor
    await Room.deleteMany({ floorId: id }); // Potential issue here

    // Delete the floor
    await floor.deleteOne(); // Or floor.remove() if you prefer

    res.json({ success: true, message: 'Floor and associated rooms deleted successfully' });
  } catch (error) {
    console.error('Error deleting floor and associated rooms:', error);
    res.status(500).json({ success: false, message: 'Error deleting floor and associated rooms' });
  }
});





module.exports = router;




