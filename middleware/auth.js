const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else {
            console.error('Error in verifyToken middleware:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = verifyToken;
