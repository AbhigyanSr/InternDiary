const express = require('express');
const router = express.Router();
const { getTasks, createTask, toggleTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.patch('/:id', protect, toggleTaskStatus);

module.exports = router;