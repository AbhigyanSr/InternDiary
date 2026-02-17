
const mongoose = require('mongoose');
const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, 
  },
  company: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['internship', 'job', 'seminar'],
    default: 'internship'
  },
  description: {
    type: String,
  },
  applyLink: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  pdfUrl: {
    type: String,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);