// server/models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: false,
  },
  status: {
    type: String,
    enum: ['applied', 'interviewing', 'rejected', 'offer'],
    default: 'applied',
  },
  appliedDate: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

applicationSchema.index(
  { user: 1, opportunity: 1 },
  {
    unique: true,
    partialFilterExpression: {
      opportunity: { $exists: true, $ne: null }
    }
  }
);

module.exports = mongoose.model('Application', applicationSchema);