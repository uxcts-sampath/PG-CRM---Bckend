const crypto = require('crypto');
const axios = require('axios');
const Payment =require('../models/payment')
const User = require('../models/user')
require('dotenv').config();
const https = require('https');
const {sendMail} = require ("../helpers/sendMail")




// const newPayment = async (req, res) => {
//     try {
//         const { userId, userSize, paymentPlan, amount } = req.body;

//         console.log('req body data',req.body)

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }
//         const userEmail = user.email;
//         const fullName = user.fullName;

        

//         let suspensionDays;
//         switch (paymentPlan) {
//             case 'yearly':
//                 suspensionDays = 365;
//                 break;
//             case 'monthly':
//                 suspensionDays = 30;
//                 break;
//             case 'free':
//                 suspensionDays = 60;
//                 break;
//             default:
//                 suspensionDays = 0;
//         }

//         const selectedDate = new Date();
//         const suspensionDate = new Date(selectedDate);
//         suspensionDate.setDate(suspensionDate.getDate() + suspensionDays);

//         const fromDate = new Date(selectedDate);
//         const toDate = new Date(suspensionDate);

//         const nextPlanDate = new Date(suspensionDate);
//         nextPlanDate.setDate(nextPlanDate.getDate() + 1);

//         const suspensionEndDate = new Date(suspensionDate);
//         suspensionEndDate.setSeconds(suspensionEndDate.getSeconds() + 1); // Add one second to suspension end date

//         await User.findByIdAndUpdate(userId, { suspensionEndDate });

      
//         // Check if suspension date is in the past
//         if (suspensionEndDate < new Date()) {
//             // Suspension date is in the past, update user document to indicate the need to select a payment plan
//             await User.findByIdAndUpdate(userId, { selectPaymentPlan: true });
//         } else {
//             // Suspension date is in the future, schedule a task to update user document after suspension end time
//             setTimeout(async () => {
//                 // Update user document to indicate the need to select a payment plan
//                 await User.findByIdAndUpdate(userId, { selectPaymentPlan: true });
//             }, suspensionEndDate.getTime() - Date.now()); // Calculate the delay until suspension end time
//         }

        
        
//         // Check if it's a free plan
//         if (paymentPlan === 'free') {
           
//             const paymentData = {
//                                 userId: userId,
//                                 selectedDate: new Date(),
//                                 transactionId: 'N/A', // Assuming no transaction ID for free plan
//                                 paymentPlan: paymentPlan,
//                                 suspensionDate: suspensionDate, // Set suspension date as current date for free plan
//                                 fromDate: fromDate, // Set from date as current date for free plan
//                                 toDate: toDate, // Set to date as current date for free plan
//                                 nextPlanDate: nextPlanDate, // Set next plan date as current date for free plan
//                                 subtotal: 0, // Set subtotal as 0 for free plan
//                                 total: 0, // Set total as 0 for free plan
//                                 userSize: userSize,
//                                 payment_status: "paid"
//                             };
//                             // Save payment data to the database
//                             await Payment.create(paymentData);

//                             await sendMail(
//                                 userEmail, // recipient's email
//                                 "Welcome to Boarderbase",
//                                 `Hi, ${fullName}, Thank you for choosing FREE plan`,
//                                 `<p>Hi, ${fullName},</p><p>Thank you for choosing ${paymentPlan} plan</p>`
//                             );
                            
//                             // Return success response
//                             return res.status(200).json({ success: true, message: 'Free plan activated successfully' });

   

                            
//         } else {
//             const merchantTransactionId = Date.now() + Math.random().toString(36).substring(2, 15);
//             const merchantUserId = userId + Date.now(); // Example: Generating merchantUserId with timestamp

//             const data = {
//                 merchantId: process.env.MERCHANT_ID,
//                 merchantTransactionId: merchantTransactionId,
//                 name: req.body.name,
//                 merchantUserId: merchantUserId,
//                 amount: amount * 100,
//                 redirectUrl: `${process.env.REDIRECT_URL}/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
//                 redirectMode: 'REDIRECT',
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

//             const prod_URL = process.env.PHONEPE_URL;
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
//                 },
//                 httpsAgent: new https.Agent({ rejectUnauthorized: false })
//             };

//             const response = await axios.request(options);

//             const transactionId = response.data?.data?.merchantTransactionId;

//             if (!transactionId) {
//                 throw new Error('Transaction ID not found in the response data');
//             }

            
//             const paymentData = {
//                 userId: userId,
//                 selectedDate: new Date(),
//                 transactionId: transactionId,
//                 paymentPlan: paymentPlan,
//                 suspensionDate:suspensionDate,  
//                 fromDate: fromDate, 
//                 toDate: toDate, 
//                 nextPlanDate: nextPlanDate, 
//                 subtotal: amount, 
//                 total: amount, 
//                 userSize: userSize,
//                 payment_status: "pending"
//             };
//             await Payment.create(paymentData);

         
//             await sendMail(
//                 userEmail, // recipient's email
//                 "Welcome to Boarderbase",
//                 `Hi, ${fullName}, Thank you for choosing FREE plan`,
//                 `<p>Hi, ${fullName},</p><p>Thank you for choosing ${paymentPlan} plan</p>`
//             );
            

//             // Return success response with URL
//             return res.status(200).send({
//                 url: response.data?.data?.instrumentResponse?.redirectInfo?.url,
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

        console.log('req body data', req.body);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const userEmail = user.email;
        const fullName = user.fullName;

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
                userSize: userSize,
                payment_status: "paid"
            };
            // Save payment data to the database
            await Payment.create(paymentData);

            // Return success response
            res.status(200).json({ success: true, message: 'Free plan activated successfully' });

            // Send welcome email after successful response
            await sendMail(
                userEmail, // recipient's email
                "Welcome to Boarderbase",
                `Hi, ${fullName}, Thank you for choosing FREE plan`,
                `<!DOCTYPE html>
                <html lang="en"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BoarderBase Registration Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            border-bottom: 2px solid #6455A5;
            color: #ffffff;
        }
        .header img {
            height: 40px;
        }
        .header a {
            color: #6455A5;
            text-decoration: none;
            font-weight: bold;
        }
        .banner {
            width: 100%;
            height: 428px;
            background-image: url('https://boarderbase.com/email-assets/bb-free-membership-banner.png');
            background-size: cover;
            background-position: center;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
        }
        .content h1 {
            color: #0066cc;
        }
        .footer {
            padding: 20px;
            background-color: #f4f4f4;
            text-align: center;
            color: #666666;
            font-size: 12px;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            color: #0066cc;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 10px;
            }
            .content {
                font-size: 14px;
            }
            .header {
                flex-direction: column;
                height: auto;
                text-align: center;
            }
            .header img {
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://boarderbase.com/email-assets/bb-email-logo.png" style="width:144px; height:19px" alt="BoarderBase Logo">
            <a href="https://www.boarderbase.com">www.boarderbase.com</a>
        </div>
        <div class="banner"></div>
        <div class="content">
           <p>Dear ${fullName},</p>
            <p>Thank you for choosing the <strong>Free Membership</strong> plan with <strong>BoarderBase</strong>. You now have access to our services for the next 60 days.</p>
            <p>After the free period, you will need to upgrade to a paid membership to continue enjoying our services. We will notify you before your free membership period expires.</p>
            <p>If you have any questions or need further assistance, feel free to reach out to our support team at <a href="mailto:support@boarderbase.com">support@boarderbase.com</a>.</p>
            <p>Thank you for your support.</p>
            <p>Best regards,<br>The BoarderBase Team</p>
        </div>
    </div>


</body></html>`
            );

        } else {
            const merchantTransactionId = Date.now() + Math.random().toString(36).substring(2, 15);
            const merchantUserId = userId + Date.now(); // Example: Generating merchantUserId with timestamp

            const data = {
                merchantId: process.env.MERCHANT_ID,
                merchantTransactionId: merchantTransactionId,
                name: req.body.name,
                merchantUserId: merchantUserId,
                amount: amount * 100,
                redirectUrl: `${process.env.REDIRECT_URL}/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
                redirectMode: 'REDIRECT',
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

            const transactionId = response.data?.data?.merchantTransactionId;

            if (!transactionId) {
                throw new Error('Transaction ID not found in the response data');
            }

            const paymentData = {
                userId: userId,
                selectedDate: new Date(),
                transactionId: transactionId,
                paymentPlan: paymentPlan,
                suspensionDate: suspensionDate,
                fromDate: fromDate,
                toDate: toDate,
                nextPlanDate: nextPlanDate,
                subtotal: amount,
                total: amount,
                userSize: userSize,
                payment_status: "pending"
            };
            await Payment.create(paymentData);

            // Return success response with URL
            res.status(200).send({
                url: response.data?.data?.instrumentResponse?.redirectInfo?.url,
                success: true,
                transactionId: transactionId // Return transactionId in the response
            });

            // Send welcome email after successful response
            await sendMail(
                userEmail, // recipient's email
                "Welcome to Boarderbase",
                `Hi, ${fullName}, Thank you for choosing ${paymentPlan} plan`,
                `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BoarderBase Registration Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            border-bottom: 2px solid #6455A5;
            color: #ffffff;
        }
        .header img {
            height: 40px;
        }
        .header a {
            color: #6455A5;
            text-decoration: none;
            font-weight: bold;
        }
        .banner {
            width: 100%;
            height: 283px;
            background-image: url('https://boarderbase.com/email-assets/bb-thankyou-banner.png');
            background-size: cover;
            background-position: center;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
        }
        .content h1 {
            color: #0066cc;
        }
        .footer {
            padding: 20px;
            background-color: #f4f4f4;
            text-align: center;
            color: #666666;
            font-size: 12px;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            color: #0066cc;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 10px;
            }
            .content {
                font-size: 14px;
            }
            .header {
                flex-direction: column;
                height: auto;
                text-align: center;
            }
            .header img {
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://boarderbase.com/email-assets/bb-email-logo.png" style="width:144px; height:19px" alt="BoarderBase Logo">
            <a href="https://www.boarderbase.com">www.boarderbase.com</a>
        </div>
        <div style="text-align: center; color: #6455A5;"><h3><b>Successfully Subscribed</b></h3></div>
        <div class="banner"></div>
        <div style="text-align: center; color: #6455A5;"><p>for Selecting <b><span style="background-color: #6455A5; color: #ffffff; padding: 5px 10px; font-size: 22px;">${paymentPlan}</span> <span style="font-size: 22px; color: #6455A5;">Membership</span> </b></p></div>
        <div class="content">
            <p>Dear ${fullName},</p>
            <p>Thank you for choosing the <strong>Yearly Membership</strong> plan with <strong>BoarderBase</strong>. You now have access to our services for the next 12 months.</p>
            <p>We are thrilled to support your hostel management needs for the entire year. Your membership will renew automatically unless canceled before the end of the current period.</p>
            <p>If you have any questions or need further assistance, feel free to reach out to our support team at <a href="mailto:support@boarderbase.com">support@boarderbase.com</a>.</p>
            <p>Thank you for your support.</p>
            <p>Best regards,<br>The BoarderBase Team</p>
        </div>
    </div>


</body></html>`
            );
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
        const { merchantTransactionId } = req.body;
        const merchantId = process.env.MERCHANT_ID;

        const key = process.env.SALT_KEY;
        const keyIndex = 1;
        const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const status_URL = `${process.env.STATUS_URL}/${merchantId}/${merchantTransactionId}`;

        const options = {
            method: 'GET',
            url: status_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': merchantId
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        };

        const response = await axios.request(options);
        if (response.data.success === true) {
            if (response.data.code === "PAYMENT_PENDING"){
                await Payment.findOneAndUpdate({ transactionId: merchantTransactionId }, { payment_status: "pending" });
                return res.status(400).send("Payment Pending");
            } else if (response.data.code === "PAYMENT_SUCCESS"){
                await Payment.findOneAndUpdate({ transactionId: merchantTransactionId }, { payment_status: "paid" });
                return res.status(200).send("Payment Success");
            }
            // const url = `http://boarderbase.com/success`;
            // return res.redirect(url);
        } else {
            await Payment.findOneAndUpdate({ transactionId: merchantTransactionId }, { payment_status: "failure" });
            return res.status(400).send("Payment Not Success");
            // const url = `http://boarderbase.com/failure`;
            // return res.redirect(url);
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
        const paymentRecord = await Payment.findOne({ userId: userId, payment_status: "paid" }).sort({ createdAt: -1 });
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


