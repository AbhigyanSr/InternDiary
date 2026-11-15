const express = require('express');
const router = express.Router();
const { getJobs, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const pdfParse = require('pdf-parse');
const { extractJobFromText } = require('../utils/llmHandler');
const { saveUploadedFile } = require('../utils/fileStorage');

// Students can see jobs
router.get('/', protect, getJobs);

// Only Admins can post jobs
router.post('/', protect, isAdmin, createJob);

// Upload a job-description PDF, extract fields with Gemini, return them for
// admin review. Nothing is published here; the admin saves via POST /api/jobs.
router.post('/parse-pdf', protect, isAdmin, upload.singleWithErrors('jobPdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload a PDF job description.' });

  let text;
  try {
    const parsed = await pdfParse(req.file.buffer);
    text = parsed.text?.trim();
  } catch (error) {
    console.error('Job PDF text extraction failed:', error.message);
    return res.status(422).json({ message: 'Could not read this PDF. It may be corrupted or password-protected.' });
  }
  if (!text) {
    return res.status(422).json({
      message: 'No selectable text was found in this PDF. Scanned or image-only PDFs cannot be extracted.',
    });
  }

  let fields;
  try {
    fields = await extractJobFromText(text);
  } catch (error) {
    console.error('Job PDF AI extraction failed:', error.message);
    const configProblem = /GEMINI_API_KEY|not approved/i.test(error.message);
    return res.status(configProblem ? 503 : 502).json({
      message: configProblem
        ? 'AI extraction is not configured on the server (check GEMINI_API_KEY / GEMINI_MODEL). You can still fill the form manually.'
        : `AI extraction failed: ${error.message.replace(/^Job extraction failed: /, '')}. You can still fill the form manually.`,
    });
  }

  try {
    const pdfUrl = await saveUploadedFile(req.file, { owner: req.user._id, kind: 'job-pdf' });
    const missingFields = ['title', 'company', 'applyLink', 'deadline', 'location', 'description']
      .filter((field) => !fields[field]);
    res.json({ ...fields, pdfUrl, missingFields });
  } catch (error) {
    console.error('Job PDF storage failed:', error.message);
    // Extraction worked; return the fields without a stored PDF reference.
    res.json({ ...fields, pdfUrl: null, missingFields: [], warning: 'PDF could not be stored; fields were still extracted.' });
  }
});

// Only Admins can update jobs
router.put('/:id', protect, isAdmin, updateJob);

// Only Admins can delete jobs
router.delete('/:id', protect, isAdmin, deleteJob);

module.exports = router;
