const HostelIncome = require('../models/hostelIncome');

// const hostelIncomeController = {};

// Get all hostel incomes
const getAllHostelIncomes = async (req, res) => {
    try {
        const hostelIncomes = await HostelIncome.find();
        res.status(200).json(hostelIncomes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get hostel income by ID
const getHostelIncomeById = async (req, res) => {
    try {
        const hostelIncome = await HostelIncome.findById(req.params.id);
        if (!hostelIncome) {
            return res.status(404).json({ message: 'Hostel income not found' });
        }
        res.status(200).json(hostelIncome);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new hostel income
const createHostelIncome = async (req, res) => {
    const hostelIncome = new HostelIncome(req.body);
    try {
        const newHostelIncome = await hostelIncome.save();
        res.status(201).json(newHostelIncome);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a hostel income by ID
const updateHostelIncomeById = async (req, res) => {
    try {
        const updatedHostelIncome = await HostelIncome.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedHostelIncome) {
            return res.status(404).json({ message: 'Hostel income not found' });
        }
        res.status(200).json(updatedHostelIncome);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a hostel income by ID
const deleteHostelIncomeById = async (req, res) => {
    try {
        const deletedHostelIncome = await HostelIncome.findByIdAndDelete(req.params.id);
        if (!deletedHostelIncome) {
            return res.status(404).json({ message: 'Hostel income not found' });
        }
        res.status(200).json({ message: 'Hostel income deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// module.exports = hostelIncomeController;

module.exports = {
    getAllHostelIncomes,
    getHostelIncomeById,
    createHostelIncome,
    updateHostelIncomeById,
    deleteHostelIncomeById
};
