// server/middleware/optionalAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Attaches req.user when a valid token is present, and calls next() either way.
// Never rejects a request. Routes using this serve guests and logged-in users
// from a single controller that branches on `if (req.user)`.
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Expired or malformed token — treat as a guest rather than an error
      req.user = null;
    }
  }

  return next();
};

module.exports = { optionalAuth };