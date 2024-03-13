
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../utils/error');
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET; 
const blacklistedTokens = new Set();
var nodemailer = require('nodemailer');







const signup = async (req, res, next) => {
    try {
        const { fullName, hostelName, email, password, aadharNumber, dateOfBirth, phoneNumber, address, country, state, city, userSize } = req.body;

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
            userSize
        });

        // Save the new user to the database
        await newUser.save();

        // Respond with success message
        res.status(201).json({ message: "Registration successful!" });
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
        const validPassword = bcrypt.compareSync(password, validUser.password);
        if (!validPassword) {
            throw errorHandler(401, 'Wrong Credentials');
        }
        const token = jwt.sign({ id: validUser._id }, jwtSecret, { expiresIn: '1d' });
        const refreshToken = jwt.sign({ id: validUser._id }, jwtSecret, { expiresIn: '1d' });
       

        const responseData = {
            token: token,
            refreshToken:refreshToken,
            user: { 
                id: validUser._id,
                fullName: validUser.fullName,
                hostelName: validUser.hostelName,
                email: validUser.email,
                aadharNumber: validUser.aadharNumber,
                dateOfBirth: validUser.dateOfBirth,
                phoneNumber: validUser.phoneNumber,
                address: validUser.address,
                country: validUser.country,
                state: validUser.state,
                city: validUser.city,
                userSize: validUser.userSize
            }
        };
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
        console.log("userId:", userId);
        console.log("token:", token);

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

  
  
module.exports = {
    signup,
    signin,
    logout,
    forgotpassword,
    resetpassword,
    resetPasswordPage,
    getUserDetails,
    checkEmailAvailability
};
