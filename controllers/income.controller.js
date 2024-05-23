// const HostelUser = require('../models/hostelUsers');

// const calculateTotalIncome = async () => {
//     try {
//         const result = await HostelUser.aggregate([
//             { $unwind: '$paymentHistory' },
//             { $group: { _id: null, totalIncome: { $sum: '$paymentHistory.amountPaid' } } }
//         ]);

//         console.log("Aggregation Result:", result);
//         const totalIncome = result.length > 0 ? result[0].totalIncome : 0;
//         console.log("Total Income Calculated using Aggregation:", totalIncome);
//         return totalIncome;
//     } catch (error) {
//         console.error('Error calculating total income using aggregation:', error);
//         throw new Error('Failed to calculate total income');
//     }
// };


// const getIncomeRecords = async (req, res) => {
//     try {
//         const totalIncome = await calculateTotalIncome();
//         res.status(200).json({ totalIncome });
//     } catch (error) {
//         console.error('Error fetching income records:', error);
//         res.status(500).json({ message: 'Failed to fetch income records' });
//     }
// };

// module.exports = {
//     getIncomeRecords
// };



const moment = require('moment-timezone');
const HostelUser = require('../models/hostelUsers');

const getPaymentRecordsAndTotalIncome = async (startDate, endDate) => {
    try {
        console.log(`Fetching records between ${startDate.toISOString()} and ${endDate.toISOString()}`);

        const paymentRecords = await HostelUser.aggregate([
            { $unwind: '$paymentHistory' },
            { 
                $match: { 
                    $or: [
                        { 'paymentHistory.billingDate': { $gte: new Date(startDate), $lte: new Date(endDate) } },
                        { 'paymentHistory.paymentDate': { $gte: new Date(startDate), $lte: new Date(endDate) } }
                    ]
                }
            },
            {
                $project: {
                    userId: '$_id',
                    billingDate: {
                        $cond: {
                            if: { $eq: ['$paymentHistory.billingDate', null] },
                            then: '$paymentHistory.paymentDate',
                            else: '$paymentHistory.billingDate'
                        }
                    },
                    payment: '$paymentHistory.payment',
                    outstanding: '$paymentHistory.outstanding',
                    amountPaid: '$paymentHistory.amountPaid'
                }
            }
        ]);

        console.log("Payment Records:", paymentRecords);

        const totalIncomeResult = await HostelUser.aggregate([
            { $unwind: '$paymentHistory' },
            { 
                $match: { 
                    $or: [
                        { 'paymentHistory.billingDate': { $gte: new Date(startDate), $lte: new Date(endDate) } },
                        { 'paymentHistory.paymentDate': { $gte: new Date(startDate), $lte: new Date(endDate) } }
                    ]
                }
            },
            { $group: { _id: null, totalIncome: { $sum: '$paymentHistory.amountPaid' } } }
        ]);

        const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].totalIncome : 0;

        console.log("Total Income Calculated:", totalIncome);

        return { paymentRecords, totalIncome };
    } catch (error) {
        console.error('Error fetching payment records and total income:', error);
        throw new Error('Failed to fetch payment records and total income');
    }
};


const getIncomeRecords = async (req, res) => {
    try {
        const { type, date } = req.query;
        let startDate, endDate;

        const selectedDate = moment.tz(date, 'YYYY-MM-DD', 'Asia/Kolkata');

        switch (type) {
            case 'day':
                startDate = selectedDate.startOf('day').toDate();
                endDate = selectedDate.endOf('day').toDate();
                break;
            case 'week':
                startDate = selectedDate.startOf('day').toDate();
                endDate = selectedDate.add(6, 'days').endOf('day').toDate();
                break;
            case 'month':
                startDate = selectedDate.startOf('day').toDate();
                endDate = selectedDate.add(1, 'month').endOf('day').toDate();
                break;
            default:
                return res.status(400).json({ message: 'Invalid type parameter' });
        }

        console.log(`Query Parameters: type=${type}, date=${date}`);
        console.log(`Date Range: startDate=${startDate.toISOString()}, endDate=${endDate.toISOString()}`);

        const { paymentRecords, totalIncome } = await getPaymentRecordsAndTotalIncome(startDate, endDate);
        res.status(200).json({ paymentRecords, totalIncome });
    } catch (error) {
        console.error('Error fetching income records:', error);
        res.status(500).json({ message: 'Failed to fetch income records' });
    }
};

module.exports = {
    getIncomeRecords
};




