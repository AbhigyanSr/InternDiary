const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['DSA', 'Resume', 'Behavioral', 'Application', 'Other'], 
    default: 'Other' 
  },
  isCompleted: { type: Boolean, default: false },
  dueDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);