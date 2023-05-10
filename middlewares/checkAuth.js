const jwt = require('jsonwebtoken');
require('dotenv').config();

const checkAuth = (req, res, next) => {
    const token = req.signedCookies.jwt;
    console.log('checking the token presence', token);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

    req.userId = decoded.id;
    next();
  });
};

module.exports = { checkAuth };
