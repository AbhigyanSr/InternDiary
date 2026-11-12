const express = require('express');
const router = express.Router();
const { getJobs, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const pdfParse = require('pdf-parse');
const fs = require('fs/promises');
const { extractJobFromText } = require('../utils/llmHandler');

// Students can see jobs
router.get('/', protect, getJobs);

// Only Admins can post jobs
router.post('/', protect, isAdmin, createJob);

const parsePdfUpload = (req, res, next) => {
  upload.single('jobPdf')(req, res, (error) => {
    if (!error) return next();
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'PDF must be 5 MB or smaller.' });
    }
    return res.status(400).json({ message: error.message || 'Invalid PDF upload.' });
  });
};

router.post('/parse-pdf', protect, isAdmin, parsePdfUpload, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload a PDF job description.' });

  try {
    const buffer = await fs.readFile(req.file.path);
    const parsed = await pdfParse(buffer);
    const text = parsed.text?.trim();
    if (!text) {
      return res.status(422).json({
        message: 'No selectable text was found in this PDF. Scanned or image-only PDFs cannot be extracted.',
      });
    }

    const fields = await extractJobFromText(text);
    res.json({
      ...fields,
      pdfUrl: req.file.path.replace(/\\/g, '/'),
    });
  } catch (error) {
    console.error('Job PDF parsing failed:', error.message);
    const status = error.message.includes('GEMINI_API_KEY') ? 503 : 422;
    res.status(status).json({ message: error.message });
  }
});

// Only Admins can update jobs
router.put('/:id', protect, isAdmin, updateJob);

// Only Admins can delete jobs
router.delete('/:id', protect, isAdmin, deleteJob);

module.exports = router;