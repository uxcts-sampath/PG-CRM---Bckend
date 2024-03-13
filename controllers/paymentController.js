const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const newPayment = async (req, res) => {
    try {

        const merchantTransactionId = Date.now() + Math.random().toString(36).substring(2, 15);
        const merchantUserId = 'MUID' + Date.now(); // Example: Generating merchantUserId with timestamp

        const data = {
            merchantId: process.env.MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            name: req.body.name,
            merchantUserId: merchantUserId,
            amount: req.body.amount * 100,
            redirectUrl: `https://api.phonepe.com/apis/hermes/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
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
        console.log(response.data);
        return res.redirect(response.data.data.instrumentResponse.redirectInfo.url);
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
        const merchantTransactionId = req.body.transactionId;
        const merchantId = process.env.MERCHANT_ID;

        const keyIndex = 1;
        const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + process.env.SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + "###" + keyIndex;

        const options = {
            method: 'POST',
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

module.exports = {
    newPayment,
    checkStatus
};
