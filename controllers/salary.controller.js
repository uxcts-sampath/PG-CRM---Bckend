// const Salary = require('../models/salary');
// const salaryController = require('./salary.controller');
// const hostelStaffController = require('./hostelstaff.controller'); // Import the createStaff controller
// const HostelStaff = require('../models/hostelStaff');
// const { updateStaffStatus } = require('./hostelstaff.controller'); // Assuming updateStaffStatus is exported




// const paySalary = async (req, res) => {
//     try {
//         const { id } = req.params; // ID of the staff member
//         const { date, total, modeofPayment, customAmount } = req.body;

//         // Fetch the staff member by ID
//         const staff = await HostelStaff.findById(id);

//         if (!staff) {
//             return res.status(404).json({ message: 'Staff not found' });
//         }

//         // Get the billing date and cycle from the staff member
//         const billingDate = new Date(staff.billingDate);
//         const billingCycle = staff.billingCycle; // 'monthly' or 'yearly'

//         // Calculate the next billing date based on the billing cycle
//         let nextBillingDate;
//         if (billingCycle === 'monthly') {
//             nextBillingDate = new Date(billingDate);
//             nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
//         } else if (billingCycle === 'yearly') {
//             nextBillingDate = new Date(billingDate);
//             nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
//         } else {
//             return res.status(400).json({ message: 'Invalid billing cycle' });
//         }

//         // Calculate the total paid amount for the current billing cycle
//         const totalPaidResult = await Salary.aggregate([
//             { $match: { staff: id, date: { $gte: billingDate, $lt: nextBillingDate } } },
//             { $group: { _id: null, totalPaid: { $sum: "$total" } } }
//         ]);

//         const totalPaid = totalPaidResult.length > 0 ? totalPaidResult[0].totalPaid : 0;

//         // Calculate the payable amount and outstanding amount based on the billing cycle
//         let payableAmount, outstandingAmount;
//         if (billingCycle === 'monthly' && totalPaid === 0) {
//             // For the first payment in the monthly billing cycle
//             payableAmount = staff.amount;
//             outstandingAmount = staff.amount - total;
//         } else if (billingCycle === 'monthly') {
//             // For subsequent payments in the monthly billing cycle
//             payableAmount = staff.amount;
//             outstandingAmount = staff.amount - (totalPaid + total);
//         } else if (billingCycle === 'yearly' && totalPaid === 0) {
//             // For the first payment in the yearly billing cycle
//             payableAmount = staff.amount;
//             outstandingAmount = staff.amount - total;
//         } else {
//             // For subsequent payments in the yearly billing cycle
//             payableAmount = staff.amount;
//             outstandingAmount = staff.amount - (totalPaid + total);
//         }

//         // Ensure the outstanding amount is not negative
//         outstandingAmount = Math.max(outstandingAmount, 0);

//         // Calculate subTotal based on payableAmount if it is there, otherwise use outstandingAmount
//         const subTotal = payableAmount > 0 ? payableAmount : outstandingAmount;

//         // Update total based on customAmount, if customAmount is provided
//         const calculatedTotal = customAmount ? customAmount : total;

//         // Create a new salary record
//         const newSalary = new Salary({
//             staff: id,
//             date,
//             payableAmount,
//             outstandingAmount,
//             modeofPayment,
//             subTotal,
//             total: calculatedTotal,
//             customAmount
//         });

//         await newSalary.save();

//         // Update staff's status based on outstanding amount
//         if (outstandingAmount === 0) {
//             staff.status = 'paid';
//         } else {
//             staff.status = 'pending';
//         }

//         // Update the staff's billing date to the next billing date
//         staff.billingDate = nextBillingDate;
//         await staff.save();

//         res.status(200).json({ message: 'Salary paid successfully', salary: newSalary });
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         res.status(500).json({ message: error.message });
//     }
// };




// const paySalary = async (req, res) => {
//     try {
//         const { id } = req.params; // ID of the staff member
//         const { date, total, modeofPayment, customAmount } = req.body;

//         // Fetch the staff member by ID
//         const staff = await HostelStaff.findById(id);

//         if (!staff) {
//             return res.status(404).json({ message: 'Staff not found' });
//         }

//         // Get the billing date and cycle from the staff member
//         const billingDate = new Date(staff.billingDate);
//         const billingCycle = staff.billingCycle; // 'monthly' or 'yearly'

//         // Calculate the next billing date based on the billing cycle
//         let nextBillingDate;
//         if (billingCycle === 'monthly') {
//             nextBillingDate = new Date(billingDate);
//             nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
//         } else if (billingCycle === 'yearly') {
//             nextBillingDate = new Date(billingDate);
//             nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
//         } else {
//             return res.status(400).json({ message: 'Invalid billing cycle' });
//         }

//         // Calculate the total paid amount for the current billing cycle
//         const totalPaidResult = await Salary.aggregate([
//             { $match: { staff: id, date: { $gte: billingDate, $lt: nextBillingDate } } },
//             { $group: { _id: null, totalPaid: { $sum: "$total" } } }
//         ]);

//         const totalPaid = totalPaidResult.length > 0 ? totalPaidResult[0].totalPaid : 0;

//         // Determine if it's the first payment in the billing cycle
//         const isFirstPayment = totalPaid === 0;

//         // Calculate the payable amount and outstanding amount based on the billing cycle
//         let payableAmount, outstandingAmount;
//         if (isFirstPayment) {
//             payableAmount = staff.amount;
//             outstandingAmount = staff.amount - total;
//         } else {
//             payableAmount = 0;
//             outstandingAmount = staff.amount - (totalPaid + total);
//         }

//         // Ensure the outstanding amount is not negative
//         outstandingAmount = Math.max(outstandingAmount, 0);

//         // Calculate subTotal based on the total paid in the current cycle
//         const calculatedSubTotal = isFirstPayment ? payableAmount : outstandingAmount;

//         // Update total based on customAmount, if customAmount is provided
//         const calculatedTotal = customAmount ? customAmount : total;

//         // Create a new salary record
//         const newSalary = new Salary({
//             staff: id,
//             date,
//             payableAmount,
//             outstandingAmount,
//             modeofPayment,
//             subTotal: calculatedSubTotal,
//             total: calculatedTotal,
//             customAmount
//         });

//         await newSalary.save();

//         // Update staff's status based on outstanding amount
//         if (outstandingAmount === 0) {
//             staff.status = 'paid';
//         } else {
//             staff.status = 'pending';
//         }

//         await staff.save();

//         res.status(200).json({ message: 'Salary paid successfully', salary: newSalary });
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         res.status(500).json({ message: error.message });
//     }
// };






// module.exports = {
//     paySalary
// };




// const Salary = require('../models/salary');
// const HostelStaff = require('../models/hostelStaff');



// const paySalary = async (req, res) => {
//     try {
//         const { id } = req.params; // ID of the staff member
//         const { date, total, modeofPayment, customAmount } = req.body;

//         // Fetch the staff member by ID
//         const staff = await HostelStaff.findById(id);

//         if (!staff) {
//             return res.status(404).json({ message: 'Staff not found' });
//         }

//         // Calculate billing start and end dates based on billing cycle
//         const paymentDate = new Date(date);
//         let billingStartDate, billingEndDate;

//         if (staff.billingCycle === 'monthly') {
//             billingStartDate = new Date(staff.billingDate);
//             billingStartDate.setMonth(billingStartDate.getMonth() - 1);
//             billingEndDate = new Date(staff.billingDate);
//         } else if (staff.billingCycle === 'yearly') {
//             billingStartDate = new Date(staff.billingDate);
//             billingStartDate.setFullYear(billingStartDate.getFullYear() - 1);
//             billingEndDate = new Date(staff.billingDate);
//         } else {
//             return res.status(400).json({ message: 'Invalid billing cycle' });
//         }

//         // Calculate the total paid amount for the current billing cycle
//         const totalPaidResult = await Salary.aggregate([
//             { $match: { staff: id, date: { $gte: billingStartDate, $lt: billingEndDate } } },
//             { $group: { _id: null, totalPaid: { $sum: "$total" } } }
//         ]);

//         const totalPaid = totalPaidResult.length > 0 ? totalPaidResult[0].totalPaid : 0;

//         // Determine if it's the first payment in the billing cycle
//         const isFirstPayment = totalPaid === 0;

//         // Calculate the payable amount and outstanding amount based on the billing cycle
//         let payableAmount, outstandingAmount;
//         if (isFirstPayment) {
//             payableAmount = staff.amount;
//             outstandingAmount = staff.amount - total;
//         } else {
//             payableAmount = 0;
//             outstandingAmount = staff.amount - (totalPaid + total);
//         }

//         // Ensure the outstanding amount is not negative
//         outstandingAmount = Math.max(outstandingAmount, 0);

//         // Calculate subTotal based on the total paid in the current cycle
//         const calculatedSubTotal = isFirstPayment ? payableAmount : outstandingAmount;

//         // Update total based on customAmount, if customAmount is provided
//         const calculatedTotal = customAmount ? customAmount : total;

//         // Create a new salary record
//         const newSalary = new Salary({
//             staff: id,
//             date,
//             payableAmount,
//             outstandingAmount,
//             modeofPayment,
//             subTotal: calculatedSubTotal,
//             total: calculatedTotal,
//             customAmount
//         });

//         await newSalary.save();

//         // Update staff's status based on outstanding amount
//         if (outstandingAmount === 0) {
//             staff.status = 'paid';
//         } else {
//             staff.status = 'pending';
//         }

//         // Update staff's next billing date
//         staff.nextBillingDate = billingEndDate;
//         await staff.save();

//         res.status(200).json({ message: 'Salary paid successfully', salary: newSalary });
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         res.status(500).json({ message: error.message });
//     }
// };


// module.exports = {
//     paySalary
// };


const Salary = require('../models/salary');
const HostelStaff = require('../models/hostelStaff');

const paySalary = async (req, res) => {
    try {
        const { id } = req.params; // ID of the staff member
        const { date, total, modeofPayment, customAmount } = req.body;

        // Fetch the staff member by ID
        const staff = await HostelStaff.findById(id);

        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        // Calculate billing start and end dates based on billing cycle
        const paymentDate = new Date(date);
        const nextBillingDate = new Date(staff.nextBillingDate);

        // Check if it's the first payment after the nextBillingDate
        const isFirstPaymentAfterNextBillingDate = paymentDate >= nextBillingDate;

        // Calculate payable amount only if it's the first payment after nextBillingDate
        let payableAmount = 0;
        if (isFirstPaymentAfterNextBillingDate) {
            payableAmount = staff.amount;
        }

        // Calculate the total paid amount for the current billing cycle
        const totalPaidResult = await Salary.aggregate([
            { $match: { staff: id, date: { $gte: staff.billingDate, $lt: nextBillingDate } } },
            { $group: { _id: null, totalPaid: { $sum: "$total" } } }
        ]);
        const totalPaid = totalPaidResult.length > 0 ? totalPaidResult[0].totalPaid : 0;

        // Calculate outstanding amount only if it's not the first payment after nextBillingDate
        let outstandingAmount = 0;
        if (!isFirstPaymentAfterNextBillingDate) {
            outstandingAmount = staff.amount - totalPaid - total;
            // Ensure the outstanding amount is not negative
            outstandingAmount = Math.max(outstandingAmount, 0);
        }

        // Calculate subTotal based on the total paid in the current cycle
        const calculatedSubTotal = isFirstPaymentAfterNextBillingDate ? payableAmount : outstandingAmount;

        // Update total based on customAmount, if customAmount is provided
        const calculatedTotal = customAmount ? customAmount : total;

        // Create a new salary record
        const newSalary = new Salary({
            staff: id,
            date,
            payableAmount,
            outstandingAmount,
            modeofPayment,
            subTotal: calculatedSubTotal,
            total: calculatedTotal,
            customAmount
        });

        await newSalary.save();

        // Update staff's status based on outstanding amount
        staff.status = calculatedSubTotal === 0 ? 'paid' : 'pending';

        // Update staff's next billing date if it's the first payment after nextBillingDate
        if (isFirstPaymentAfterNextBillingDate) {
            staff.nextBillingDate = nextBillingDate;
        }

        await staff.save();

        res.status(200).json({ message: 'Salary paid successfully', salary: newSalary });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    paySalary
};



