const express = require('express');
const router = express.Router();
const {
  getInterviews,
  createInterview,
  getInterviewById,
  approveInterview,
  rejectInterview,
  getPendingInterviews,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const { optionalAuth } = require('../models/optionalAuth');

// Moderation queue — declared before '/:id' so 'pending' is never read as an id
router.get('/pending', protect, isAdmin, getPendingInterviews);

// Guests get a capped preview; logged-in users get full search/filter/pagination
router.get('/', optionalAuth, getInterviews);

// Writable only after login
router.post('/', protect, createInterview);

// Guests get a truncated preview; logged-in users get the full record
router.get('/:id', optionalAuth, getInterviewById);

router.put('/:id/approve', protect, isAdmin, approveInterview);
router.delete('/:id', protect, isAdmin, rejectInterview);

module.exports = router;
