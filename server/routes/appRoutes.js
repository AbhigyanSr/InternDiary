const express = require('express');
const router = express.Router();
// 1. Check this path and names
const { 
  getApplications, 
  addApplication, 
  updateAppStatus,
  deleteApplication
} = require('../controllers/appController');

// 2. Check this import
const { protect } = require('../middleware/authMiddleware');

// If either 'protect' or 'getApplications' is undefined, Express throws the error you see.
router.get('/', protect, getApplications); 
router.post('/', protect, addApplication);
router.patch('/:id', protect, updateAppStatus);
router.delete('/:id', protect, deleteApplication);

module.exports = router;