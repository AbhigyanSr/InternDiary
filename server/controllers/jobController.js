const Opportunity = require('../models/Opportunity');
const { storedFileIdFromPath, deleteStoredFileByPath } = require('../utils/fileStorage');

const OPPORTUNITY_TYPES = ['Internship', 'Hackathon', 'Webinar'];

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) {
    return [...new Set(skills.map((skill) => String(skill).trim()).filter(Boolean))];
  }
  if (typeof skills === 'string') {
    return [...new Set(skills.split(',').map((skill) => skill.trim()).filter(Boolean))];
  }
  return [];
};

// Accepts MongoDB-stored files (/api/files/<id>) and legacy disk paths (uploads/...).
const normalizePdfUrl = (pdfUrl) => {
  if (typeof pdfUrl !== 'string' || !pdfUrl.trim()) return null;
  const normalized = pdfUrl.trim().replace(/\\/g, '/');
  if (storedFileIdFromPath(normalized)) return normalized;
  return normalized.startsWith('uploads/') ? normalized : null;
};

const isBlank = (value) => value === undefined || value === null || (typeof value === 'string' && !value.trim());

// Returns { value } or { error }. Blank → value undefined (field unset).
const parseExperience = (value) => {
  if (isBlank(value)) return { value: undefined };
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return { error: 'Experience must be a non-negative number' };
  return { value: number };
};

const parseDeadline = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sendError = (res, error) => {
  const isClientError = error.name === 'ValidationError' || error.name === 'CastError';
  res.status(isClientError ? 400 : 500).json({ message: error.message });
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

    if (isBlank(company) || isBlank(title) || isBlank(applyLink) || isBlank(deadline)) {
      return res.status(400).json({ message: 'Please fill all required fields: company, title, application link and deadline' });
    }
    const deadlineDate = parseDeadline(deadline);
    if (!deadlineDate) return res.status(400).json({ message: 'Deadline is not a valid date' });
    const experience = parseExperience(experienceYears);
    if (experience.error) return res.status(400).json({ message: experience.error });

    const job = await Opportunity.create({
      company: company.trim(),
      title: title.trim(),
      applyLink: applyLink.trim(),
      deadline: deadlineDate,
      description: isBlank(description) ? undefined : description.trim(),
      type: OPPORTUNITY_TYPES.includes(type) ? type : 'Internship',
      location: isBlank(location) ? undefined : location.trim(),
      skillsRequired: normalizeSkills(skillsRequired),
      experienceYears: experience.value,
      pdfUrl: normalizePdfUrl(requestedPdfUrl) || undefined,
      postedBy: req.user.id, // Linked to the Admin who created it
    });

    res.status(201).json(job);
  } catch (error) {
    sendError(res, error);
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
// Required fields keep their old value when sent blank; optional fields
// (description, location, skills, experience, pdfUrl) can be cleared.
const updateJob = async (req, res) => {
  try {
    const { company, title, applyLink, deadline, description, type, location, skillsRequired, experienceYears, pdfUrl } = req.body;

    const job = await Opportunity.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (!isBlank(company)) job.company = company.trim();
    if (!isBlank(title)) job.title = title.trim();
    if (!isBlank(applyLink)) job.applyLink = applyLink.trim();
    if (!isBlank(deadline)) {
      const deadlineDate = parseDeadline(deadline);
      if (!deadlineDate) return res.status(400).json({ message: 'Deadline is not a valid date' });
      job.deadline = deadlineDate;
    }
    if (OPPORTUNITY_TYPES.includes(type)) job.type = type;
    if (description !== undefined) job.description = isBlank(description) ? undefined : description.trim();
    if (location !== undefined) job.location = isBlank(location) ? undefined : location.trim();
    if (skillsRequired !== undefined) job.skillsRequired = normalizeSkills(skillsRequired);
    if (experienceYears !== undefined) {
      const experience = parseExperience(experienceYears);
      if (experience.error) return res.status(400).json({ message: experience.error });
      job.experienceYears = experience.value;
    }
    if (pdfUrl !== undefined) job.pdfUrl = normalizePdfUrl(pdfUrl) || undefined;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    sendError(res, error);
  }
};

// @desc    Delete a job posting (Admin Only)
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Opportunity.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    await job.deleteOne();
    if (job.pdfUrl) {
      deleteStoredFileByPath(job.pdfUrl).catch((error) => console.error('Job PDF cleanup failed:', error.message));
    }
    res.json({ message: 'Job removed' });
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = { createJob, getJobs, updateJob, deleteJob };
