const express = require('express');
const router = express.Router();
const { getJobs, createJob } = require('../controllers/jobController'); // Ensure createJob is in your controller
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// Students can see jobs
router.get('/', protect, getJobs);

// Only Admins can post jobs
router.post('/', protect, isAdmin, createJob);

module.exports = router;