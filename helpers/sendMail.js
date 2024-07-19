const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "product.support@uxcts.com",
    pass: "connectUxcts#2024!",
  },
});



// async..await is not allowed in global scope, must use a wrapper
async function sendMail(to, subject, text, html) {
    try {
      const info = await transporter.sendMail({
        from: 'product.support@uxcts.com', // sender address
        to,
        subject,
        text,
        html
      });
      console.log("Message sent: %s", info.messageId);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }



module.exports = {sendMail}


