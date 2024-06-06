const crypto = require('crypto');
const axios = require('axios');
const Payment =require('../models/payment')
const User = require('../models/user')
require('dotenv').config();
const https = require('https');






const newPayment = async (req, res) => {
    try {
        const { userId, userSize, paymentPlan, amount } = req.body;

        let suspensionDays;
        switch (paymentPlan) {
            case 'yearly':
                suspensionDays = 365;
                break;
            case 'monthly':
                suspensionDays = 30;
                break;
            case 'free':
                suspensionDays = 60;
                break;
            default:
                suspensionDays = 0;
        }

        const selectedDate = new Date();
        const suspensionDate = new Date(selectedDate);
        suspensionDate.setDate(suspensionDate.getDate() + suspensionDays);

        const fromDate = new Date(selectedDate);
        const toDate = new Date(suspensionDate);

        const nextPlanDate = new Date(suspensionDate);
        nextPlanDate.setDate(nextPlanDate.getDate() + 1);

        const suspensionEndDate = new Date(suspensionDate);
        suspensionEndDate.setSeconds(suspensionEndDate.getSeconds() + 1); // Add one second to suspension end date

        await User.findByIdAndUpdate(userId, { suspensionEndDate });

        // Check if suspension date is in the past
        if (suspensionEndDate < new Date()) {
            // Suspension date is in the past, update user document to indicate the need to select a payment plan
            await User.findByIdAndUpdate(userId, { selectPaymentPlan: true });
        } else {
            // Suspension date is in the future, schedule a task to update user document after suspension end time
            setTimeout(async () => {
                // Update user document to indicate the need to select a payment plan
                await User.findByIdAndUpdate(userId, { selectPaymentPlan: true });
            }, suspensionEndDate.getTime() - Date.now()); // Calculate the delay until suspension end time
        }

        
        
        // Check if it's a free plan
        if (paymentPlan === 'free') {
           
            const paymentData = {
                                userId: userId,
                                selectedDate: new Date(),
                                transactionId: 'N/A', // Assuming no transaction ID for free plan
                                paymentPlan: paymentPlan,
                                suspensionDate: suspensionDate, // Set suspension date as current date for free plan
                                fromDate: fromDate, // Set from date as current date for free plan
                                toDate: toDate, // Set to date as current date for free plan
                                nextPlanDate: nextPlanDate, // Set next plan date as current date for free plan
                                subtotal: 0, // Set subtotal as 0 for free plan
                                total: 0, // Set total as 0 for free plan
                                userSize: userSize
                            };
                            // Save payment data to the database
                            await Payment.create(paymentData);

                            console.log('payment Daaata',paymentData)
                            
                            // Return success response
                            return res.status(200).json({ success: true, message: 'Free plan activated successfully' });

                            
        } else {
           const merchantTransactionId = Date.now() + Math.random().toString(36).substring(2, 15);
            const merchantUserId = userId + Date.now(); // Example: Generating merchantUserId with timestamp

            const data = {
                merchantId: process.env.MERCHANT_ID,
                merchantTransactionId: merchantTransactionId,
                name: req.body.name,
                merchantUserId: merchantUserId,
                amount: amount * 100,
                redirectUrl: `https://boarderbase.com/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
                redirectMode: 'POST',
                mobileNumber: req.body.number,
                paymentInstrument: { 
                    type: 'PAY_PAGE'
                }
            };
            const payload = JSON.stringify(data);
            const payloadMain = Buffer.from(payload).toString('base64');
            const key = process.env.SALT_KEY;
            const keyIndex = 1;
            const string = payloadMain + '/pg/v1/pay' + key;
            const sha256 = crypto.createHash('sha256').update(string).digest('hex');
            const checksum = sha256 + '###' + keyIndex;

            const prod_URL = process.env.PHONEPE_URL;
            const options = {
                method: 'POST',
                url: prod_URL,
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum
                },
                data: {
                    request: payloadMain
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            };

            const response = await axios.request(options);
            console.log('response', response.data);

            const transactionId = response.data?.data?.merchantTransactionId;

            if (!transactionId) {
                throw new Error('Transaction ID not found in the response data');
            }

            
            const paymentData = {
                userId: userId,
                selectedDate: new Date(),
                transactionId: transactionId,
                paymentPlan: paymentPlan,
                suspensionDate:suspensionDate,  
                fromDate: fromDate, 
                toDate: toDate, 
                nextPlanDate: nextPlanDate, 
                subtotal: amount, 
                total: amount, 
                userSize: userSize
            };
            await Payment.create(paymentData);

         

            

            // Return success response with URL
            return res.status(200).send({
                url: response.data?.data?.instrumentResponse?.redirectInfo?.url,
                success: true,
                transactionId: transactionId // Return transactionId in the response
            });
            
            
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: error.message,
            success: false
        });
    }
};

const checkStatus = async (req, res) => {
    try {
        const merchantTransactionId = merchantTransactionId;
        const merchantId = process.env.MERCHANT_ID;

        const keyIndex = 1;
        const string = ` apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}` + process.env.SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + "###" + keyIndex;

        const options = {
            method: 'GET',
            url: `https://boarderbase.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': merchantId
            }
        };

        const response = await axios.request(options);
        console.log(response.data);
        if (response.data.success === true) {
            const url = `http://boarderbase.com/success`;
            return res.redirect(url);
        } else {
            const url = `http://boarderbase.com/failure`;
            return res.redirect(url);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: error.message,
            success: false
        });
    }
};

const getPaymentDetails = async (req, res) => {
    try {
        // Extract userId from request parameters
        const userId = req.params.userId;

        // Retrieve payment details from the database
        const payment = await Payment.findOne({ userId });

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        // Format date fields to only display date part
        const formattedPayment = {
            ...payment.toObject(), // Convert Mongoose document to plain JavaScript object
            selectedDate: payment.selectedDate.toISOString().split('T')[0], // Format selectedDate
            suspensionDate: payment.suspensionDate.toISOString().split('T')[0], // Format suspensionDate
            fromDate: payment.fromDate.toISOString().split('T')[0], // Format fromDate
            toDate: payment.toDate.toISOString().split('T')[0], // Format toDate
            nextPlanDate: payment.nextPlanDate.toISOString().split('T')[0] // Format nextPlanDate
        };


        // Determine if payment was successful based on userId
        const paymentSuccessful = !!payment.userId; // Assuming userId indicates success

        // Update payment status in the database if necessary
        if (paymentSuccessful && !payment.success) {
            await Payment.findOneAndUpdate({ userId }, { success: true });
        }

        // Return payment details in the response
        return res.status(200).json({ success: true, data: formattedPayment, paymentSuccessful });
    } catch (error) {
        console.error(error);

        // Handle various types of errors
        let errorMessage = 'An error occurred while retrieving payment details.';
        if (error.name === 'CastError') {
            errorMessage = 'Invalid user ID format.';
        }

        return res.status(500).json({ success: false, message: errorMessage });
    }
};

const getUserPaymentStatus = async (req, res) => {
    const userId = req.userId;

    try {
        const paymentRecord = await Payment.findOne({ userId: userId }).sort({ createdAt: -1 });
        const freePlan = await Payment.findOne({ userId: userId, paymentPlan: "free" });
        let hasActivePlan;
        let hasfreePlan;

        if (paymentRecord) {
            let suspensionDate = new Date(paymentRecord.suspensionDate);
            let suspensionDateMilliseconds = suspensionDate.getTime();
            let presentMilliseconds = Date.now();

            if (presentMilliseconds > suspensionDateMilliseconds) {
                hasActivePlan = false;
            } else {
                hasActivePlan = true;
            }
        } else {
            hasActivePlan = false;
        }

        if (freePlan) {
            hasfreePlan = true;
        } else {
            hasfreePlan = false;
        }

        return res.status(200).json({ hasActivePlan: hasActivePlan, hasfreePlan: hasfreePlan });
    } catch (error) {
      console.error('Error in getUserPaymentPlan:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}




module.exports = {
    newPayment,
    checkStatus,
    getPaymentDetails,
    getUserPaymentStatus
};


