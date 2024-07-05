// controllers/hostelMembershipController.js

const HostelMembership = require('../models/hostelMembership');

// Helper function to calculate the end date based on the starting date and service period
const calculateEndDate = (startDate, paymentPlan) => {
  let endDate = new Date(startDate);

  switch (paymentPlan) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    case 'free':
      endDate.setDate(endDate.getDate() + 60); // Assuming 60 days for free plan, adjust as needed
      break;
    default:
      endDate = null; // Invalid payment plan
  }

  return endDate;
};

// Function to format date to only display date part
const formatDate = (date) => {
  return date.toLocaleDateString('en-US');
};

// Controller methods
const createHostelMembership = async (req, res) => {
  try {
    const { userId, userSize, paymentPlan } = req.body;

    const hostelMembership = new HostelMembership({
      userId, 
      userSize,
      paymentPlan,
    });

    await hostelMembership.save();
    res.status(201).json(hostelMembership);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllHostelMembershipsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const memberships = await HostelMembership.find({ userId });

    // Calculate the service period and end date for each membership
    const membershipsWithServicePeriod = memberships.map(membership => {
      const startDate = new Date(membership.createdAt); // Assuming createdAt field is the starting date
      const endDate = calculateEndDate(startDate, membership.paymentPlan);
      const formattedStartDate = formatDate(startDate); // Format start date to only display date
      const formattedEndDate = endDate ? formatDate(endDate) : null; // Format end date to only display date
      const servicePeriod = `${formattedStartDate} - ${formattedEndDate}`;

      return {
        ...membership.toJSON(),
        createdAt: formattedStartDate,
        suspensionDate: formattedEndDate,
        servicePeriod: servicePeriod
      };
    });

    res.status(200).json(membershipsWithServicePeriod);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createHostelMembership,
  getAllHostelMembershipsByUserId
};
