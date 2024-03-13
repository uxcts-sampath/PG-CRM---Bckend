const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const HostelUser = require('../models/hostelUsers');
const jwt = require('jsonwebtoken');
const Room = require('../models/rooms')

// Middleware function to verify JWT token

const createHostelUser = async (req, res) => {
    try {
        const { floor, room, bed, ...userData } = req.body;
        const userId = req.userId;

        // Convert floor and room IDs to ObjectId
        const floorId = new ObjectId(floor);
        const roomId = new ObjectId(room);

        // Find the room in the database
        const foundRoom = await Room.findById(roomId);
        if (!foundRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if the bed is available
        const isBedAvailable = foundRoom.beds.some(b => b.bedNumber === bed && b.status === 'available');
        if (!isBedAvailable) {
            return res.status(400).json({ message: 'Bed not available' });
        }

        // Update bed status to 'occupied'
        foundRoom.beds.find(b => b.bedNumber === bed).status = 'occupied';
        await foundRoom.save();

        // Creating new hostel user...
        const hostelUser = new HostelUser({
            ...userData,
            userId,
            floor: floorId,
            room: roomId,
            bed
        });

        // Save the hostel user to the database
        await hostelUser.save();

        res.status(201).json(hostelUser);
    } catch (error) {
        console.error('Error creating hostel user:', error);
        res.status(400).json({ message: error.message });
    }
};















const assignBed = async (floorNumber, roomNumber, bedNumber) => {
    try {
        const room = await Room.findOne({ floor: floorNumber, roomNumber });
        if (!room) {
            throw new Error('Room not found');
        }

        // Find the bed within the room
        const bed = room.beds.find(bed => bed.bedNumber === bedNumber);
        if (!bed || bed.status !== 'available') {
            throw new Error('Bed not available');
        }

        // Update bed status to 'occupied'
        bed.status = 'occupied';

        // Save the updated room (which includes the updated bed status)
        await room.save();

        return bed;
    } catch (error) {
        throw new Error('Failed to assign bed: ' + error.message);
    }
};





const getAllHostelUsers = async (req, res) => {
    const userId = req.userId;
    try {
        const hostelUsers = await HostelUser.find({ userId });
        res.status(200).json(hostelUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getHostelUserById = async (req, res) => {
    const userId = req.userId;
    try {
        const hostelUser = await HostelUser.findById(userId);
        if (hostelUser) {
            res.status(200).json(hostelUser);
        } else {
            res.status(404).json({ message: 'Hostel user not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateHostelUserById = async (req, res, userId, id) => {
    try {
        console.log('Received PUT request to update user with ID:', id);
        
        // Log the request body to inspect the payload data
        console.log('Request body:', req.body);
    
        // Implement logic to update user data in the database
        const updatedUser = await HostelUser.findByIdAndUpdate(id, req.body, { new: true });
        
        // Fetch updated user data
        const hostelUser = await HostelUser.findById(id);
        
        // Log database operations
        console.log('Updating user data in the database...');
        
        // Send a success response back to the frontend with the updated user data
        res.status(201).json({ success: true, message: 'User updated successfully', hostelUser });
    } catch (error) {
        // Handle errors and send an error response
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};






  

const deleteHostelUserById = async (req, res) => {
    const userId = req.userId;
    try {
        const deletedHostelUser = await HostelUser.findByIdAndDelete(userId);
        if (deletedHostelUser) {
            res.status(200).json({ message: 'Hostel user deleted successfully' });
        } else {
            res.status(404).json({ message: 'Hostel user not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllStudentHostelUsers = async (req, res) => {
    try {
        const userId = req.userId;
        const hostelUsers = await HostelUser.find({ userId, userType: 'student' });
        // const studentHostelUsers = await HostelUser.find({ userType: 'student' });
        res.status(200).json(hostelUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllWorkingEmployeeHostelUsers = async (req, res) => {
    const userId = req.userId;
    try {
        const workingEmployeeHostelUsers = await HostelUser.find({userId, userType: 'working emp' });
        res.status(200).json(workingEmployeeHostelUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllGuestHostelUsers = async (req, res) => {
    const userId = req.userId;
    try {
        const guestHostelUsers = await HostelUser.find({userId, userType: 'guest' });
        res.status(200).json(guestHostelUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

 
const getAvailableBeds = async (floorNumber, roomNumber) => {
    try {
        const room = await Room.findOne({ floor: floorNumber, roomNumber });
        if (!room) {
            throw new Error('Room not found');
        }

        // Filter available beds within the room
        const availableBeds = room.beds.filter(bed => bed.status === 'available');

        return availableBeds;
    } catch (error) {
        throw new Error('Failed to get available beds: ' + error.message);
    }
};


const renderCreateFormWithAvailableBeds = async (req, res) => {
    try {
        // Fetch available floors
        const floors = await Floor.find().lean();
        const availableFloors = floors.map(floor => ({
            floorNumber: floor.floorNumber,
            rooms: floor.rooms.map(room => ({
                roomNumber: room.roomNumber,
                availableBeds: room.totalBeds - room.occupiedBeds
            }))
        }));

        res.render('createHostelUser', { availableFloors });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





 

module.exports = {
    getAllHostelUsers,
    createHostelUser,
    getHostelUserById,
    updateHostelUserById,
    deleteHostelUserById,
    getAllStudentHostelUsers,
    getAllWorkingEmployeeHostelUsers,
    getAllGuestHostelUsers,
    getAvailableBeds,
    renderCreateFormWithAvailableBeds,
    assignBed
};
