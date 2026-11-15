const express = require('express');
const router = express.Router();
const { getPublicNews, getPersonalizedNews, triggerRefresh, getNewsStatus } = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

router.get('/public', getPublicNews);
router.get('/personalized', protect, getPersonalizedNews);
router.get('/status', protect, isAdmin, getNewsStatus);
router.post('/refresh', protect, isAdmin, triggerRefresh);

module.exports = router;
