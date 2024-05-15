const HostelUser = require('../models/hostelUsers');

const calculateTotalIncome = async () => {
    try {
        const result = await HostelUser.aggregate([
            { $unwind: '$paymentHistory' },
            { $group: { _id: null, totalIncome: { $sum: '$paymentHistory.amountPaid' } } }
        ]);

        console.log("Aggregation Result:", result);
        const totalIncome = result.length > 0 ? result[0].totalIncome : 0;
        console.log("Total Income Calculated using Aggregation:", totalIncome);
        return totalIncome;
    } catch (error) {
        console.error('Error calculating total income using aggregation:', error);
        throw new Error('Failed to calculate total income');
    }
};


const getIncomeRecords = async (req, res) => {
    try {
        const totalIncome = await calculateTotalIncome();
        res.status(200).json({ totalIncome });
    } catch (error) {
        console.error('Error fetching income records:', error);
        res.status(500).json({ message: 'Failed to fetch income records' });
    }
};

module.exports = {
    getIncomeRecords
};
