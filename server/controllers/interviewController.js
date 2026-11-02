const Interview = require('../models/Interview');

// Guests only get a short teaser of the write-up, not the full rounds/tips.
const PREVIEW_CHARS = 220;

const truncate = (text = '', limit = PREVIEW_CHARS) => {
  if (!text || text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}…`;
};

// Strips an interview down to a guest-safe preview: short teaser text,
// no rounds detail, no tips.
const toPreview = (interview) => {
  const obj = interview.toObject ? interview.toObject() : interview;
  const teaser = obj.rounds && obj.rounds.length ? obj.rounds[0] : obj.tips;
  return {
    _id: obj._id,
    company: obj.company,
    role: obj.role,
    difficulty: obj.difficulty,
    outcome: obj.outcome,
    createdAt: obj.createdAt,
    preview: truncate(teaser),
  };
};

// @desc    List interview experiences.
//          Guests (no token): capped, unfiltered, truncated preview list.
//          Logged-in users: full records with search, filters, pagination.
// @route   GET /api/interviews
const getInterviews = async (req, res) => {
  try {
    if (!req.user) {
      const guestList = await Interview.find({ isApproved: true })
        .sort({ createdAt: -1 })
        .limit(6);
      return res.json({
        interviews: guestList.map(toPreview),
        page: 1,
        pages: 1,
        total: guestList.length,
      });
    }

    const { search, difficulty, outcome, page = 1, limit = 10 } = req.query;

    const query = { isApproved: true };
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ company: regex }, { role: regex }];
    }
    if (difficulty) query.difficulty = difficulty;
    if (outcome) query.outcome = outcome;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const [interviews, total] = await Promise.all([
      Interview.find(query)
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Interview.countDocuments(query),
    ]);

    res.json({
      interviews,
      page: pageNum,
      pages: Math.max(Math.ceil(total / limitNum), 1),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit an interview experience (goes into the moderation queue)
// @route   POST /api/interviews
const createInterview = async (req, res) => {
  try {
    const { company, role, difficulty, rounds, tips, outcome } = req.body;

    if (!company || !role || !outcome) {
      return res.status(400).json({ message: 'Company, role, and outcome are required' });
    }

    const interview = await Interview.create({
      company,
      role,
      difficulty,
      rounds: Array.isArray(rounds) ? rounds.filter(Boolean) : [],
      tips,
      outcome,
      author: req.user.id,
      isApproved: false,
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get one interview experience.
//          Guests get the truncated preview; logged-in users get the full body.
// @route   GET /api/interviews/:id
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('author', 'name');
    if (!interview) return res.status(404).json({ message: 'Interview experience not found' });

    const isOwnerOrAdmin =
      req.user && (req.user.role === 'admin' || interview.author._id.toString() === req.user.id);

    if (!interview.isApproved && !isOwnerOrAdmin) {
      return res.status(404).json({ message: 'Interview experience not found' });
    }

    if (!req.user) {
      return res.json(toPreview(interview));
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a submitted interview experience (Admin only)
// @route   PUT /api/interviews/:id/approve
const approveInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview experience not found' });

    interview.isApproved = true;
    await interview.save();

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject (delete) a submitted interview experience (Admin only)
// @route   DELETE /api/interviews/:id
const rejectInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview experience not found' });

    await interview.deleteOne();
    res.json({ message: 'Interview experience removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List interviews awaiting moderation, oldest first (Admin only)
// @route   GET /api/interviews/pending
const getPendingInterviews = async (req, res) => {
  try {
    const pending = await Interview.find({ isApproved: false })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInterviews,
  createInterview,
  getInterviewById,
  approveInterview,
  rejectInterview,
  getPendingInterviews,
};
