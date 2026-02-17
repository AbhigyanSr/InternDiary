const Application = require('../models/Application');

// Get all applications for the logged-in user
const getApplications = async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(apps);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// Log a new application
const addApplication = async (req, res) => {
  try {
    const { company, role, status, notes, opportunity } = req.body;
    if (!company || !role) {
      return res.status(400).json({ message: 'Company and role are required' });
    }

    const newAppData = {
      user: req.user.id,
      company,
      role,
      status: status || 'applied',
      notes
    };

    if (opportunity) {
      newAppData.opportunity = opportunity;
    }

    const newApp = new Application(newAppData);

    await newApp.save();
    res.status(201).json(newApp);
  } catch (error) {
    console.error('Error saving application:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Application already tracked for this opportunity' });
    }
    if (error.name === 'ValidationError') {
      const fields = Object.keys(error.errors || {});
      return res.status(400).json({
        message: `Validation error: ${fields.join(', ')}`,
        error: error.message
      });
    }
    return res.status(400).json({
      message: error?.message || 'Error saving application',
      error: error?.message
    });
  }
};

// Update application status
const updateAppStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status, notes },
      { new: true }
    );
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.status(200).json(app);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
};

// THIS IS THE PART THAT WAS LIKELY MISSING:
module.exports = {
  getApplications,
  addApplication,
  updateAppStatus
};