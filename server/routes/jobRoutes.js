const express = require('express');
const router = express.Router();
const { getJobs, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// Students can see jobs
router.get('/', protect, getJobs);

// Only Admins can post jobs
router.post('/', protect, isAdmin, createJob);

// Only Admins can update jobs
router.put('/:id', protect, isAdmin, updateJob);

// Only Admins can delete jobs
router.delete('/:id', protect, isAdmin, deleteJob);

module.exports = router;