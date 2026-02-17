const Task = require('../models/Task');

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const { title, category, dueDate } = req.body;

    const newTask = new Task({
      user: req.user.id,
      title,
      category,
      dueDate
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: 'Error creating task' });
  }
};

// Toggle status
const toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.isCompleted = !task.isCompleted;
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
};

module.exports = {
  getTasks,
  createTask,
  toggleTaskStatus
};
