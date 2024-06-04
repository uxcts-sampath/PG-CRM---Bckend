const PaymentPlan = require('../models/paymentPlan');

const selectPaymentPlan = async (req, res) => {
  const { userId, userSize, paymentPlan, amount, transactionId } = req.body;

  try {
    const paymentPlanRecord = await PaymentPlan.findOneAndUpdate(
      { userId: userId },
      {
        userId,
        userSize,
        paymentPlan,
        amount,
        transactionId,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, data: paymentPlanRecord });
  } catch (error) {
    console.error('Error in selectPaymentPlan:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getUserPaymentPlan = async (req, res) => {
  const userId = req.user.userId;

  try {
    const paymentPlanRecord = await PaymentPlan.findOne({ userId: userId });

    if (!paymentPlanRecord) {
      return res.status(404).json({ success: false, message: 'Payment plan not found' });
    }

    res.status(200).json({ success: true, data: paymentPlanRecord });
  } catch (error) {
    console.error('Error in getUserPaymentPlan:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  selectPaymentPlan,
  getUserPaymentPlan,
};
