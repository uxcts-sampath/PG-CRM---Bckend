const HostelUser = require('../models/hostelUsers'); // Ensure the model is correctly imported

const calculateTotalIncome = async () => {
    try {
        // Find all hostel users
        const hostelUsers = await HostelUser.find();

        // Calculate total income from hostel user payment history
        let totalIncome = 0;
        hostelUsers.forEach(user => {
            user.paymentHistory.forEach(payment => {
                // Access the correct field based on your schema
                totalIncome += payment.amountPaid;
            });
        });

        console.log("Total Income Calculated:", totalIncome); // Log to check the total income computed
        return totalIncome;
    } catch (error) {
        console.error('Error calculating total income:', error);
        throw new Error('Failed to calculate total income');
    }
};

const getIncomeRecords = async (req, res) => {
    try {
        // Calculate total income
        const totalIncome = await calculateTotalIncome();

        // Respond with total income
        res.status(200).json({ totalIncome });
    } catch (error) {
        console.error('Error fetching income records:', error);
        res.status(500).json({ message: 'Failed to fetch income records' });
    }
};

module.exports = {
    getIncomeRecords
};
