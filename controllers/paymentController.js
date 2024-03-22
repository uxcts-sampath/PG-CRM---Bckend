const crypto = require('crypto');
const axios = require('axios');
const Payment =require('../models/payment')
const User = require('../models/user')
require('dotenv').config();

// const newPayment = async (req, res) => { 
//     try {
//         const userId = req.userId;
//         const merchantTransactionId = Date.now() + Math.random().toString(36).substring(2, 15);
//         const merchantUserId = userId + Date.now(); // Example: Generating merchantUserId with timestamp

//         const data = {
//             merchantId: process.env.MERCHANT_ID,
//             merchantTransactionId: merchantTransactionId,
//             name: req.body.name,
//             merchantUserId: merchantUserId,
//             amount: req.body.amount * 100,
//             // redirectUrl: `https://api.phonepe.com/apis/hermes/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
//             redirectUrl: `https://google.com/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
//             redirectMode: 'POST',
//             mobileNumber: req.body.number,
//             paymentInstrument: { 
//                 type: 'PAY_PAGE'
//             }
//         };
//         const payload = JSON.stringify(data);
//         const payloadMain = Buffer.from(payload).toString('base64');
//         const key = process.env.SALT_KEY;
//         const keyIndex = 1;
//         const string = payloadMain + '/pg/v1/pay' + key;
//         const sha256 = crypto.createHash('sha256').update(string).digest('hex');
//         const checksum = sha256 + '###' + keyIndex;

//         const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
//         const options = {
//             method: 'POST',
//             url: prod_URL,
//             headers: {
//                 accept: 'application/json',
//                 'Content-Type': 'application/json',
//                 'X-VERIFY': checksum
//             },
//             data: {
//                 request: payloadMain
//             }
//         };

//         const response = await axios.request(options);
//         console.log(response.data);
      

       
//         return res.status(200).send({
//             url: response.data.data.instrumentResponse.redirectInfo.url,
//             success: true
//         });
        
//     //   const url= response.data.data.instrumentResponse.redirectInfo.url;
//     //   return url
//     //   res.redirect(url)
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send({
//             message: error.message,
//             success: false
//         });
//     }
// };


// const newPayment = async (req, res) => { 
//     try {
//         const { userId, userSize, paymentPlan, amount } = req.body;
        
//         // Check if it's a free plan
//         if (paymentPlan === 'free') {
//             // Perform actions specific to the free plan, such as updating the database
//             const paymentData = {
//                 userId: userId,
//                 selectedDate: new Date(),
//                 transactionId: 'N/A', // Assuming no transaction ID for free plan
//                 paymentPlan: paymentPlan,
//                 suspensionDate: new Date(), // Set suspension date as current date for free plan
//                 fromDate: new Date(), // Set from date as current date for free plan
//                 toDate: new Date(), // Set to date as current date for free plan
//                 nextPlanDate: new Date(), // Set next plan date as current date for free plan
//                 subtotal: 0, // Set subtotal as 0 for free plan
//                 total: 0, // Set total as 0 for free plan
//                 userSize: userSize
//             };
//             // Save payment data to the database
//             await Payment.create(paymentData);
            
//             // Return success response
//             return res.status(200).json({ success: true, message: 'Free plan activated successfully' });
//         } else {
//             // Handle payment plans other than 'free'
//             const merchantTransactionId = Date.now() + Math.random().toString(36).substring(2, 15);
//             const merchantUserId = userId + Date.now(); // Example: Generating merchantUserId with timestamp

//             const data = {
//                 merchantId: process.env.MERCHANT_ID,
//                 merchantTransactionId: merchantTransactionId,
//                 name: req.body.name,
//                 merchantUserId: merchantUserId,
//                 amount: amount * 100,
//                 redirectUrl: `https://google.com/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
//                 redirectMode: 'POST',
//                 mobileNumber: req.body.number,
//                 paymentInstrument: { 
//                     type: 'PAY_PAGE'
//                 }
//             };
//             const payload = JSON.stringify(data);
//             const payloadMain = Buffer.from(payload).toString('base64');
//             const key = process.env.SALT_KEY;
//             const keyIndex = 1;
//             const string = payloadMain + '/pg/v1/pay' + key;
//             const sha256 = crypto.createHash('sha256').update(string).digest('hex');
//             const checksum = sha256 + '###' + keyIndex;

//             const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
//             const options = {
//                 method: 'POST',
//                 url: prod_URL,
//                 headers: {
//                     accept: 'application/json',
//                     'Content-Type': 'application/json',
//                     'X-VERIFY': checksum
//                 },
//                 data: {
//                     request: payloadMain
//                 }
//             };

//             const response = await axios.request(options);
//             console.log('response',response.data);


//             const transactionId = response.data?.data?.merchantTransactionId;

// if (!transactionId) {
//     // Handle case where transactionId is not found in the response
//     throw new Error('Transaction ID not found in the response data');
// }

//             // Assuming successful payment
//             // Save payment data to the database
           
//             const paymentData = {
//                 userId: userId,
//                 selectedDate: new Date(),
//                 transactionId: transactionId, // Assigning transaction ID from PhonePe API response
//                 paymentPlan: paymentPlan,
//                 suspensionDate: new Date(), // Set suspension date as current date for paid plan
//                 fromDate: new Date(), // Set from date as current date for paid plan
//                 toDate: new Date(), // Set to date as current date for paid plan
//                 nextPlanDate: new Date(), // Set next plan date as current date for paid plan
//                 subtotal: amount, // Set subtotal as the amount for paid plan
//                 total: amount, // Set total as the amount for paid plan
//                 userSize: userSize
//             };
//             // Save payment data to the database
//             await Payment.create(paymentData);

//             // Return success response with URL
//             return res.status(200).send({
//                 url: response.data.data.instrumentResponse.redirectInfo.url,
//                 success: true
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send({
//             message: error.message,
//             success: false
//         });
//     }
// };


// const newPayment = async (req, res) => { 
//     try {
//         const { userId, userSize, paymentPlan, amount } = req.body;
        
//         // Check if it's a free plan
//         if (paymentPlan === 'free') {
//             // Perform actions specific to the free plan, such as updating the database
//             const paymentData = {
//                 userId: userId,
//                 selectedDate: new Date(),
//                 transactionId: 'N/A', // Assuming no transaction ID for free plan
//                 paymentPlan: paymentPlan,
//                 suspensionDate: new Date(), // Set suspension date as current date for free plan
//                 fromDate: new Date(), // Set from date as current date for free plan
//                 toDate: new Date(), // Set to date as current date for free plan
//                 nextPlanDate: new Date(), // Set next plan date as current date for free plan
//                 subtotal: 0, // Set subtotal as 0 for free plan
//                 total: 0, // Set total as 0 for free plan
//                 userSize: userSize
//             };
//             // Save payment data to the database
//             await Payment.create(paymentData);
            
//             // Return success response
//             return res.status(200).json({ success: true, message: 'Free plan activated successfully' });
//         } else {
//             // Handle payment plans other than 'free'
//             const merchantTransactionId = Date.now() + Math.random().toString(36).substring(2, 15);
//             const merchantUserId = userId + Date.now(); // Example: Generating merchantUserId with timestamp

//             const data = {
//                 merchantId: process.env.MERCHANT_ID,
//                 merchantTransactionId: merchantTransactionId,
//                 name: req.body.name,
//                 merchantUserId: merchantUserId,
//                 amount: amount * 100,
//                 redirectUrl: `https://google.com/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
//                 redirectMode: 'POST',
//                 mobileNumber: req.body.number,
//                 paymentInstrument: { 
//                     type: 'PAY_PAGE'
//                 }
//             };
//             const payload = JSON.stringify(data);
//             const payloadMain = Buffer.from(payload).toString('base64');
//             const key = process.env.SALT_KEY;
//             const keyIndex = 1;
//             const string = payloadMain + '/pg/v1/pay' + key;
//             const sha256 = crypto.createHash('sha256').update(string).digest('hex');
//             const checksum = sha256 + '###' + keyIndex;

//             const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
//             const options = {
//                 method: 'POST',
//                 url: prod_URL,
//                 headers: {
//                     accept: 'application/json',
//                     'Content-Type': 'application/json',
//                     'X-VERIFY': checksum
//                 },
//                 data: {
//                     request: payloadMain
//                 }
//             };

//             const response = await axios.request(options);
//             console.log('response', response.data);

//             const transactionId = response.data?.data?.merchantTransactionId;

//             if (!transactionId) {
//                 // Handle case where transactionId is not found in the response
//                 throw new Error('Transaction ID not found in the response data');
//             }

//             // Return success response with URL
//             return res.status(200).send({
//                 url: response.data.data.instrumentResponse.redirectInfo.url,
//                 success: true,
//                 transactionId: transactionId // Return transactionId in the response
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send({
//             message: error.message,
//             success: false
//         });
//     }
// };


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

                            console.log('paymnetDaaata',paymentData)
                            
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
                redirectUrl: `https://api.phonepe.com/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
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

            const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
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
                }
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
            url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
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
            const url = `http://localhost:3000/success`;
            return res.redirect(url);
        } else {
            const url = `http://localhost:3000/failure`;
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

        // Log payment details (Avoid logging sensitive information)
        console.log('Payment Details:', payment);

        // Determine if payment was successful based on userId
        const paymentSuccessful = !!payment.userId; // Assuming userId indicates success

        // Update payment status in the database if necessary
        if (paymentSuccessful && !payment.success) {
            await Payment.findOneAndUpdate({ userId }, { success: true });
        }

        // Return payment details in the response
        return res.status(200).json({ success: true, data: payment, paymentSuccessful });
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





module.exports = {
    newPayment,
    checkStatus,
    getPaymentDetails
};


