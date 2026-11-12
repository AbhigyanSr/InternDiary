const Opportunity = require('../models/Opportunity');

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill).trim()).filter(Boolean);
  }
  if (typeof skills === 'string') {
    return skills.split(',').map((skill) => skill.trim()).filter(Boolean);
  }
  return [];
};

const normalizePdfUrl = (pdfUrl) => {
  if (typeof pdfUrl !== 'string' || !pdfUrl.trim()) return null;
  const normalized = pdfUrl.trim().replace(/\\/g, '/');
  return normalized.startsWith('uploads/') ? normalized : null;
};

// @desc    Create a new internship (Admin Only)
// @route   POST /api/jobs
const createJob = async (req, res) => {
  try {
    const {
      company,
      title,
      applyLink,
      deadline,
      description,
      type,
      location,
      skillsRequired,
      experienceYears,
      pdfUrl: requestedPdfUrl,
    } = req.body;
    
    // Optional: If you want admins to upload a specific JD PDF for the job
    const pdfUrl = req.file ? req.file.path : normalizePdfUrl(requestedPdfUrl);

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
      location,
      skillsRequired: normalizeSkills(skillsRequired),
      experienceYears: experienceYears === '' || experienceYears === null || experienceYears === undefined
        ? undefined
        : Number(experienceYears),
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
    const { company, title, applyLink, deadline, description, type, location, skillsRequired, experienceYears } = req.body;
    
    const job = await Opportunity.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Update fields
    job.company = company || job.company;
    job.title = title || job.title;
    job.applyLink = applyLink || job.applyLink;
    job.deadline = deadline || job.deadline;
    job.description = description || job.description;
    job.type = type || job.type;
    job.location = location || job.location;
    if (skillsRequired !== undefined) job.skillsRequired = normalizeSkills(skillsRequired);
    if (experienceYears !== undefined && experienceYears !== '') job.experienceYears = Number(experienceYears);

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