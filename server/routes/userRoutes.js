// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getMe, updatePreferences, getDomains } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/domains', getDomains);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);

module.exports = router;