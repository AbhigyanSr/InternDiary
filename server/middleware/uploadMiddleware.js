const multer = require('multer');
const path = require('path');

// Files are kept in memory and then persisted to MongoDB (see utils/fileStorage.js).
// Local disk is not used because Render's free-tier filesystem is not persistent.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check extension and mimetype
  const isPdf = file.mimetype === 'application/pdf';
  const isExtPdf = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdf && isExtPdf) {
    cb(null, true);
  } else {
    // Pass an error object instead of just a string for better error handling
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Wraps upload.single() so multer errors become JSON 400/413 responses.
upload.singleWithErrors = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (!error) return next();
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'PDF must be 5 MB or smaller.' });
    }
    return res.status(400).json({ message: error.message || 'Invalid PDF upload.' });
  });
};

module.exports = upload;
