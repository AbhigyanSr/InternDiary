// server/controllers/userController.js
const User = require('../models/User');
const { TECH_DOMAINS } = require('../constants/domains');

// @desc    Get the logged-in user's full profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredDomains: user.preferredDomains || [],
      profile: user.profile,
      resumePath: user.resumePath,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update the logged-in user's domain preferences
// @route   PUT /api/users/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    const { preferredDomains } = req.body;

    if (!Array.isArray(preferredDomains)) {
      return res.status(400).json({ message: 'preferredDomains must be an array' });
    }

    const invalid = preferredDomains.filter((domain) => !TECH_DOMAINS.includes(domain));
    if (invalid.length > 0) {
      return res.status(400).json({ message: `Invalid domain(s): ${invalid.join(', ')}` });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferredDomains: [...new Set(preferredDomains)] },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Preferences updated successfully',
      preferredDomains: user.preferredDomains,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List the selectable tech domains
// @route   GET /api/users/domains
// @access  Public
const getDomains = (req, res) => {
  res.json({ domains: TECH_DOMAINS });
};

module.exports = { getMe, updatePreferences, getDomains };