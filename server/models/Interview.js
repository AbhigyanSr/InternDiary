const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    rounds: {
      // Each entry is one round's account, e.g. "Round 1 (OA): ..."
      type: [String],
      default: [],
    },
    tips: {
      type: String,
      default: '',
      trim: true,
    },
    outcome: {
      type: String,
      enum: ['Accepted', 'Rejected'],
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Moderation gate — false until an admin approves it. See approveInterview.
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Interview', interviewSchema);
