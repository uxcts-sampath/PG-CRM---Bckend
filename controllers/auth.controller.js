const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../utils/error');
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET; 
const blacklistedTokens = new Set();
const transporter = require('../config/nodemailer');

// const transporter = nodemailer.createTransport({
// 	service: "zoho",
// 	host: "smtp.zoho.in",
// 	port: 465,
// 	auth: {
// 		user: "product.support@uxcts.com",
// 		pass: "Connect$Product#2023!",
// 	},
// });

const signup = async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            fullName: req.body.fullName,
            hostelName: req.body.hostelName,
            email: req.body.email,
            password: hashedPassword,
            aadharNumber: req.body.aadharNumber,
            dateOfBirth: req.body.dateOfBirth,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            userSize: req.body.userSize
        });
        await newUser.save();
        const mailOptions = {
			from: "product.support@uxcts.com",
			to: req.body.email,
			subject: "Welcome to BoardeBase Hostel Managment CRM",
			text: `Hello ${req.body.fullName},\n\nWelcome to our platform! We are excited to have you as a member.\n\nBest regards,\nThe Team`,
        
		};
       
        // console.log(mailOptions);

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

module.exports = {
    signup,
    signin,
    logout
};
