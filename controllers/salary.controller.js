const Salary = require('../models/salary');
const HostelStaff = require('../models/hostelStaff');

const generateNextBillingDate = (currentBillingDate, billingCycle) => {
    const date = new Date(currentBillingDate);
    switch (billingCycle) {
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
        // Add more cases for other billing cycles if needed
        default:
            throw new Error('Unsupported billing cycle');
    }
    return date;
};

const createSalary = async (req, res) => {
    try {
        const { staffId } = req.params;
        const {
            payableAmount = 0,
            outstandingAmount = 0,
            modeofPayment,
            customAmount = 0,
            date // Assuming 'date' is the payment date from req.body
        } = req.body;

    

        const staff = await HostelStaff.findById(staffId);
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found for staffId: ' + staffId });
        }

        const payableAmountNum = Number(payableAmount);
        const outstandingAmountNum = Number(outstandingAmount);
        const customAmountNum = Number(customAmount);

        // Calculate subTotal as the sum of payableAmount and outstandingAmount
        const subTotal = payableAmountNum + outstandingAmountNum;

        // Calculate total based on customAmount if provided; otherwise, use subTotal
        let total = customAmountNum > 0 ? customAmountNum : subTotal;

        // Calculate outstandingAmount as the difference between subTotal and total
        const outstandingAmountCalc = subTotal - total;

        const paymentDate = new Date(date);

        // Check if billingDate for the current billing cycle needs to be generated
        if (!staff.billingDate || staff.billingDate <= paymentDate) {
            // Generate billingDate for the first transaction in the billing cycle
            staff.billingDate = generateNextBillingDate(staff.billingDate || paymentDate, staff.billingCycle);

            // Save the updated billingDate
            await staff.save();
        }

        // Check if payableAmount needs to be generated for the current billing cycle
        const lastBillingDate = new Date(staff.lastBillingDateGenerated || 0);
        if (lastBillingDate < staff.billingDate) {
            // Logic for generating the payableAmount if it's not static
            // Here, we assume payableAmount is provided; modify as needed if there's a generation logic
            staff.lastBillingDateGenerated = paymentDate;
            await staff.save();
        }

        const newSalary = new Salary({
            staff: staffId,
            payableAmount: payableAmountNum,
            modeofPayment,
            subTotal,
            total,
            outstandingAmount: outstandingAmountCalc,
            customAmount: customAmountNum,
            date: paymentDate // Convert 'date' to Date object
        });

        const savedSalary = await newSalary.save();

        // Update staff's status based on outstanding amount
        if (outstandingAmountCalc === 0) {
            staff.status = 'paid';
        } else {
            staff.status = 'pending';
        }
        await staff.save();


        const allSalaries = await Salary.find({ staff: staffId });


        res.status(201).json({
            message: 'Salary paid successfully',
            newSalary: savedSalary,
            allSalaries: allSalaries
        });    } catch (error) {
        console.error('Error in createSalary:', error);
        res.status(400).json({ message: error.message });
    }
};

const getTransactionsForStaffId = async (req, res) => {
    try {
        const { staffId } = req.params;

        const allSalaries = await Salary.find({ staff: staffId });

          // Format date in each salary object
          const formattedSalaries = allSalaries.map(salary => ({
            ...salary.toObject(),
            date: salary.date.toLocaleDateString() // Format date to only include the date part
        }));

        res.status(200).json(formattedSalaries);
    } catch (error) {
        console.error('Error in getTransactionsForStaffId:', error);
        res.status(400).json({ message: error.message });
    }
};


module.exports = {
    createSalary,
    getTransactionsForStaffId
};

