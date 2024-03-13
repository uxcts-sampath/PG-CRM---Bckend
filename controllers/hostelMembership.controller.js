// controllers/hostelMembershipController.js

const HostelMembership = require('../models/hostelMembership');

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

module.exports = {
  createHostelMembership
}