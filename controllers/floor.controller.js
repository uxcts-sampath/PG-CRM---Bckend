const Floor = require('../models/floor');
const Room = require('../models/rooms')
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
        const floors = await Floor.find({ user: userId }).lean(); // Filter floors by userId

        // Iterate through each floor
        for (const floor of floors) {
            // Fetch rooms associated with the floor
            const rooms = await Room.find({ floorId: floor._id }).lean();
            let totalBeds = 0;
            let occupiedBeds = 0;

            // Iterate through each room to count beds
            for (const room of rooms) {
                totalBeds += room.totalBeds;
                occupiedBeds += room.occupiedBeds;
            }

            // Calculate available beds
            const availableBeds = totalBeds - occupiedBeds;

            // Add availableBeds property to the floor object
            floor.availableBeds = availableBeds;
        }

        res.status(200).json(floors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteFloor = async (req, res) => {
    const userId = req.userId; // Extracted from JWT token
    const floorId = req.params.id;
  
    console.log('Floor ID:', floorId);
    console.log('User ID:', userId);
  
    try {
      // Find the floor by ID and ensure that it belongs to the current user
      const floor = await Floor.findOne({ _id: floorId, user: userId });
  
      if (!floor) {
        console.error('Floor not found or not authorized to delete');
        return res.status(404).json({ message: 'Floor not found or not authorized to delete' });
      }
  
      // Check if there are any rooms associated with the floor
      const rooms = await Room.find({ floor: floorId });
  
      if (rooms.length > 0) {
        // If rooms exist, delete them first
        await Room.deleteMany({ floor: floorId });
        console.log(`${rooms.length} rooms deleted for floor ${floorId}`);
      }
  
      // Once rooms are deleted (or if there are no rooms), delete the floor
      await Floor.findOneAndDelete({ _id: floorId, user: userId });
      console.log(`Floor ${floorId} deleted successfully`);
  
      res.status(200).json({ message: 'Floor deleted successfully' });
    } catch (error) {
      console.error('Error deleting floor:', error);
      res.status(500).json({ message: 'Error deleting floor', error: error.message });
    }
  };
  
  
  



module.exports = {
    pgfloor,
    getAllFloors,
    deleteFloor
};
