const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Ensure upload directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Using req.user.id (from auth middleware) makes file management much easier
    const uniqueSuffix = req.user ? req.user.id : Date.now();
    cb(null, `resume-${uniqueSuffix}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

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

module.exports = upload;