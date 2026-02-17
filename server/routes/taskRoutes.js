const express = require('express');
const router = express.Router();
const { getTasks, createTask, toggleTaskStatus, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.patch('/:id', protect, toggleTaskStatus);
router.delete('/:id', protect, deleteTask);

module.exports = router;