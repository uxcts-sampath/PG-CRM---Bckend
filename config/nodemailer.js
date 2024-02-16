// config/nodemailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "zoho",
	host: "smtp.zoho.in",
	port: 465,
	auth: {
		user: "product.support@uxcts.com",
		pass: "connectUxcts#2024!",
	}
});

module.exports = transporter;
