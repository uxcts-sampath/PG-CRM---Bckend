const bcrypt = require('bcrypt');
const User = require('../models/user');
const Payment = require('../models/payment')
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../utils/error');
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET; 
const blacklistedTokens = new Set();
var nodemailer = require('nodemailer');
const { sendMail } = require('../helpers/sendMail');



// const signup = async (req, res, next) => {
//     try {
//         const { fullName, hostelName, email, password, aadharNumber, dateOfBirth, phoneNumber, address, country, state, city, userSize } = req.body;

//         // Check if the email already exists in the database
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             throw errorHandler(400, 'Email already exists');
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create a new user object
//         const newUser = new User({
//             fullName,
//             hostelName,
//             email,
//             password: hashedPassword,
//             aadharNumber,
//             dateOfBirth,
//             phoneNumber,
//             address,
//             country,
//             state,
//             city,
//             userSize,
//             status: 'pending' // Set status to pending
//         });

//         // Save the new user to the database
//         await newUser.save();

    

//         // Respond with success message
//         res.status(201).json({ message: "Registration successful!" });

//     await sendMail(
//         email, // recipient's email
//         "Welcome to Boarderbase",
//         `Hi, ${fullName}, Thank you for registering.Please wait for Admin approval`,
//         `<p>Hi, ${fullName},</p><p>Thank you for registering.Please wait for Admin approval</p>`
//     );

//     } catch (error) {
//         next(error);
//     }
// };



const signup = async (req, res, next) => {
    try {
        const { fullName, hostelName,gender, email, password, aadharNumber, dateOfBirth, phoneNumber, address, country, state, city, userSize } = req.body;

        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw errorHandler(400, 'Email already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user object
        const newUser = new User({
            fullName,
            gender,
            hostelName,
            email,
            password: hashedPassword,
            aadharNumber,
            dateOfBirth,
            phoneNumber,
            address,
            country,
            state,
            city,
            userSize,
            status: 'pending' // Set status to pending
        });

        // Save the new user to the database
        await newUser.save();

        

        // Respond with success message
        res.status(201).json({ message: "Registration successful!" });

        // Send welcome email
        await sendMail(
            email, 
            "Welcome to Boarderbase", 
            `Hi, ${fullName}, Thank you for registering. Please wait for Admin approval.`,
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
            background-image: url('https://boarderbase.com/email-assets/welcome%20bb.png');
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
            <p>Thank you for enrolling with <strong>BoarderBase</strong>, your comprehensive hostel management software. We are excited to have you on board!</p>
            <p>Your enrollment is currently under review by our administrative team. Please allow us some time to process your registration. You will receive an email notification once your enrollment has been approved.</p>
            <p>If you have any questions or need further assistance, feel free to reach out to our support team at <a href="mailto:support@boarderbase.com">support@boarderbase.com</a>.</p>
            <p>Thank you for your patience.</p>
            <p>Best regards,<br>The BoarderBase Team</p>
        </div>
        <div class="footer">
            <p>© 2024 BoarderBase. All rights reserved.</p>
            <p>Visit our website: <a href="https://www.boarderbase.com">www.boarderbase.com</a> | Contact Support: <a href="mailto:support@boarderbase.com">support@boarderbase.com</a></p>
            <p>Powered by Connect UX Technology Solutions Pvt Ltd.</p>
        </div>
    </div>


</body></html>`
        );

    } catch (error) {
        next(error);
    }
};


const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const validUser = await User.findOne({ email });

        if (!validUser) {
            throw errorHandler(404, 'User not found');
        }

        if (validUser.status === 'pending') {
            return res.status(403).json({ message: 'Your account is pending approval.' });
        }

        if (validUser.status === 'hold') {
            return res.status(403).json({ message: 'Your account is on hold. Please contact support.' });
        }

        if (validUser.status === 'suspended') {
            return res.status(403).json({ message: 'Your account is suspended.' });
        }

        const isPasswordValid = await bcrypt.compare(password, validUser.password);

                // If password is invalid, return error
                if (!isPasswordValid) {
                    throw errorHandler(401, 'Invalid password');
                }


        const today = new Date(); // Define today's date
        
        // Retrieve payment information for the user
        const payment = await Payment.findOne({ userId: validUser._id });

        // Calculate suspension date based on payment information
        const suspensionEndDate = payment ? payment.suspensionDate : null;
        const suspensionDate = suspensionEndDate < today ? today : suspensionEndDate;

        // Check if the user has an active payment plan
        const activePaymentPlan = await Payment.findOne({
            userId: validUser._id,
            toDate: { $gte: today }
        });

        // Determine if the user has used the free payment plan
        const hasUsedFreePlan = payment && payment.paymentPlan === 'free';

        // Determine if the user has already used the free payment plan based on email ID
        const existingFreePlanUser = await Payment.findOne({
            email: email,
            paymentPlan: 'free'
        });

        // Determine if the free option should be hidden
        const hideFreeOption = hasUsedFreePlan || !!existingFreePlanUser;

        // If the user has already used the free plan and is trying to select it again, throw an error
        if (hideFreeOption && req.body.paymentPlan === 'free') {
            throw errorHandler(400, 'You have already used the free payment plan.');
        }

        const transactionId = payment ? payment.transactionId : null;

        // Generate token and refreshToken
        const token = jwt.sign({ id: validUser._id }, jwtSecret, { expiresIn: '1d' });
        const refreshToken = jwt.sign({ id: validUser._id }, jwtSecret, { expiresIn: '1d' });

        // Construct response data
        const responseData = {
            token: token,
            refreshToken: refreshToken,
            user: {
                id: validUser._id,
                fullName: validUser.fullName,
                gender:validUser.gender,
                hostelName: validUser.hostelName,
                email: validUser.email,
                aadharNumber: validUser.aadharNumber,
                dateOfBirth: validUser.dateOfBirth,
                phoneNumber: validUser.phoneNumber,
                address: validUser.address,
                country: validUser.country,
                state: validUser.state,
                city: validUser.city,
                userSize: validUser.userSize,
                hasActivePaymentPlan: !!activePaymentPlan,
                selectPaymentPlan: suspensionDate !== null, 
                suspensionDate: suspensionDate,
                paymentPlan: payment ? payment.paymentPlan : null,
                hideFreeOption: hideFreeOption,
                transactionId: transactionId
            }
        };
        

        // Set tokens in the response header and send response
        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json(responseData);

    } catch (error) {
        next(error);
    }
};


const logout = async (req, res) => {
    try {
        // Extract the token from the request headers
        const token = req.headers.authorization.split(' ')[1]; // Assuming the token is passed in the 'Authorization' header

        // Add the token to the blacklist
        blacklistedTokens.add(token);

        // Instead of clearing the cookie here, it's more common to let the client-side handle removing the token

        res.status(200).json({ message: 'Signout successful' });
    } catch (error) {
        console.error("Error during signout:", error.message);
        // Handle error if necessary
        res.status(500).json({ message: 'Internal server error' });
    }
};


const forgotpassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if the user with the provided email exists
        const validUser = await User.findOne({ email });
        if (!validUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a unique token for email verification
        const token = jwt.sign({ id: validUser._id }, jwtSecret, { expiresIn: '1d' });

        var transporter = nodemailer.createTransport({
            service: 'zoho',
            host: 'smtp.zoho.in',
            auth: {
                user: 'product.support@uxcts.com',
                pass: 'connectUxcts#2024!'
            }
        });

        var mailOptions = {
            from: 'product.support@uxcts.com',
            to: req.body.email,
            subject: 'Reset Your Password',
            text: `http://localhost:5173/resetpassword/${validUser._id}/${token}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Failed to send email" });
            } else {
                return res.status(200).json({ message: "Email sent successfully" });
            }
        });
    } catch (error) {
        next(error);
    }
};


const resetpassword = async (req, res, next) => {
    try {
        const { userId, password } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            throw errorHandler(404, 'User not found');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};


const resetPasswordPage = async (req, res, next) => {
    try {
        // Extract userId and token from req.params
        const { userId, token } = req.params;
       

        // Validate the token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Token is invalid or expired
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            // Token is valid, render the reset password page with the userId and token
            res.render('resetpassword', { userId, token });
        });
    } catch (error) {
        next(error);
    }
};

const getUserDetails = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

const checkEmailAvailability = async (req, res, next) => {
    try {
        const { email } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(200).json({ available: false }); // Email is already taken
        } else {
            res.status(200).json({ available: true }); // Email is available
        }
    } catch (error) {
        next(error);
    }
};


const updateUserStatus = async (req, res, next) => {
    try {
        const { userId, status } = req.body;

        if (!['pending', 'approved', 'hold', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = status;
        await user.save();

        res.status(200).json({ message: 'User status updated successfully' });
    } catch (error) {
        next(error);
    }
};

  
module.exports = {
    signup,
    signin,
    logout,
    forgotpassword,
    resetpassword,
    resetPasswordPage,
    getUserDetails,
    checkEmailAvailability,
    updateUserStatus
};
