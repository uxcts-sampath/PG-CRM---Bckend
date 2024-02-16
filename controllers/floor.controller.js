const Floor = require('../models/floor');
const jwtSecret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

const pgfloor = async (req, res) => {
    const { floorName, floorNumber, commonWashroomCount } = req.body;
    const userId = req.user.id; // Extracted from JWT token
    
    try {
        const newFloor = new Floor({
            user: userId,
            floorName,
            floorNumber,
            commonWashroomCount
        });

        await newFloor.save();
        res.status(201).json({ 
            message: "Floor added successfully!",
            token: req.headers.authorization, // Include token
            userId
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllFloors = async (req, res) => {
    try {
        const userId = req.user.id; // Extracted from JWT token
        const floors = await Floor.find({ user: userId }); // Filter floors by userId
        res.status(200).json(floors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteFloor = async (userId, floorId) => {
    try {
      // Find the floor by ID and ensure that it belongs to the current user
      const deletedFloor = await Floor.findOneAndDelete({ _id: floorId, user: userId });
      return deletedFloor;
    } catch (error) {
      throw new Error('Error deleting floor');
    }
  };

module.exports = {
    pgfloor,
    getAllFloors,
    deleteFloor
};
