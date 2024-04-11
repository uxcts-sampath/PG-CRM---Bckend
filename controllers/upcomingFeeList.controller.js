// controllers/upcomingFeeController.js
const UpcomingFee = require('../models/upcomingFee');

const getUpcomingFeeList = async (req, res) => {
    try {
        const userId = req.userId; // Assuming you have middleware to extract userId from the token

        // Find upcoming fees for the user
        const upcomingFees = await UpcomingFee.find({ userId });

        res.status(200).json(upcomingFees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUpcomingFeeList
};
