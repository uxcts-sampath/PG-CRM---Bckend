const HostelUser = require('../models/hostelUsers');

// GET all hostel users
const getAllHostelUsers = async (req, res) => {
    try {
        const hostelUsers = await HostelUser.find();
        res.status(200).json(hostelUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST a new hostel user
const createHostelUser = async (req, res) => {
    const hostelUser = new HostelUser(req.body);
    try {
        const newHostelUser = await hostelUser.save();
        res.status(201).json(newHostelUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET a hostel user by ID
const getHostelUserById = async (req, res) => {
    try {
        const hostelUser = await HostelUser.findById(req.params.id);
        if (hostelUser) {
            res.status(200).json(hostelUser);
        } else {
            res.status(404).json({ message: 'Hostel user not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE a hostel user by ID
const updateHostelUserById = async (req, res) => {
    try {
        const updatedHostelUser = await HostelUser.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedHostelUser) {
            res.status(200).json(updatedHostelUser);
        } else {
            res.status(404).json({ message: 'Hostel user not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE a hostel user by ID
const deleteHostelUserById = async (req, res) => {
    try {
        const deletedHostelUser = await HostelUser.findByIdAndDelete(req.params.id);
        if (deletedHostelUser) {
            res.status(200).json({ message: 'Hostel user deleted successfully' });
        } else {
            res.status(404).json({ message: 'Hostel user not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET all student hostel users
const getAllStudentHostelUsers = async (req, res) => {
    try {
        const studentHostelUsers = await HostelUser.find({ userType: 'student' });
        res.status(200).json(studentHostelUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET all working employee hostel users
const getAllWorkingEmployeeHostelUsers = async (req, res) => {
    try {
        const workingEmployeeHostelUsers = await HostelUser.find({ userType: 'working emp' });
        res.status(200).json(workingEmployeeHostelUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET all guest hostel users
const getAllGuestHostelUsers = async (req, res) => {
    try {
        const guestHostelUsers = await HostelUser.find({ userType: 'guest' });
        res.status(200).json(guestHostelUsers);
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
    getAllGuestHostelUsers
};
