const mongoose = require('mongoose');

// Uploaded PDFs (resumes, job descriptions) are stored in MongoDB rather than
// on local disk because Render's free-tier filesystem is wiped whenever the
// service restarts or sleeps. Files are capped at 5 MB by the upload middleware,
// well under MongoDB's 16 MB document limit.
const storedFileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    kind: { type: String, enum: ['resume', 'job-pdf'], required: true },
    filename: { type: String, required: true },
    contentType: { type: String, default: 'application/pdf' },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('StoredFile', storedFileSchema);
