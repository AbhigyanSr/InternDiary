// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPasswordToken } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordToken);

module.exports = router;