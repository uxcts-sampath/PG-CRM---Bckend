const moment = require('moment-timezone');
const HostelUser = require('../models/hostelUsers');

const getPaymentRecordsAndTotalIncome = async (startDate, endDate) => {
    try {

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


        const { paymentRecords, totalIncome } = await getPaymentRecordsAndTotalIncome(startDate, endDate);


        // Format dates to only include date part
        const formattedPaymentRecords = paymentRecords.map(record => ({
            ...record,
            billingDate: moment(record.billingDate).format('YYYY-MM-DD'),
            paymentDate: moment(record.paymentDate).format('YYYY-MM-DD')
        }));

        res.status(200).json({ paymentRecords: formattedPaymentRecords, totalIncome });

    } catch (error) {
        console.error('Error fetching income records:', error);
        res.status(500).json({ message: 'Failed to fetch income records' });
    }
};

module.exports = {
    getIncomeRecords
};




