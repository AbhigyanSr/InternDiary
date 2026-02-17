const Opportunity = require('../models/Opportunity');

// @desc    Create a new internship (Admin Only)
// @route   POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { company, title, applyLink, deadline, description, type } = req.body;
    
    // Optional: If you want admins to upload a specific JD PDF for the job
    const pdfUrl = req.file ? req.file.path : null; 

    if (!company || !title || !applyLink || !deadline) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const job = await Opportunity.create({
      company,
      title,
      applyLink,
      deadline,
      description,
      type,
      pdfUrl,
      postedBy: req.user.id, // Linked to the Admin who created it
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all internship postings
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  try {
    // Show newest jobs first
    const jobs = await Opportunity.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a job posting (Admin Only)
// @route   PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const { company, title, applyLink, deadline, description, type } = req.body;
    
    const job = await Opportunity.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Update fields
    job.company = company || job.company;
    job.title = title || job.title;
    job.applyLink = applyLink || job.applyLink;
    job.deadline = deadline || job.deadline;
    job.description = description || job.description;
    job.type = type || job.type;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job posting (Admin Only)
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Opportunity.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createJob, getJobs, updateJob, deleteJob };