const HostelStaff = require('../models/hostelStaff');



const createStaff = async (req, res) => {
    try {
        const { userId } = req;
        const { billingCycle, billingDate: initialBillingDate } = req.body;
        let billingDate = initialBillingDate || new Date(); // Default to current date if not provided


        const staffData = { ...req.body, userId, status: 'pending',billingDate ,billingCycle};

        const newStaff = new HostelStaff(staffData); 
        const savedStaff = await newStaff.save();


        res.status(201).json(savedStaff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateStaffStatus = async (staffId, status) => {
    try {
        const staff = await HostelStaff.findByIdAndUpdate(staffId, { status }, { new: true });
        return staff;
    } catch (error) {
        throw new Error(error.message);
    }
};



// Edit Staff
const editStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const updatedStaff = await HostelStaff.findByIdAndUpdate(id, { ...req.body, userId }, { new: true });

        if (!updatedStaff) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        res.status(200).json(updatedStaff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Staff
const deleteStaff = async (req, res) => {
    try { 
        const { id } = req.params;
        const deletedStaff = await HostelStaff.findByIdAndDelete(id);

        if (!deletedStaff) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        res.status(200).json({ message: 'Staff deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Staff
const getAllStaff = async (req, res) => {
    try {
        const { userId } = req;
        const staffList = await HostelStaff.find({ userId });

        res.status(200).json(staffList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Staff by ID
const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const staff = await HostelStaff.findOne({ _id: id, userId });

        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createStaff,
    editStaff,
    deleteStaff,
    getAllStaff,
    getStaffById,
    updateStaffStatus
};
