const express = require('express');
const mongoose = require('mongoose');
const StoredFile = require('../models/StoredFile');

const router = express.Router();

// @desc    Serve an uploaded PDF inline (opened from <a href> links, so no auth header)
// @route   GET /api/files/:id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'File not found' });
    const file = await StoredFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const safeName = file.filename.replace(/[^\w.\- ]/g, '_');
    res.set({
      'Content-Type': file.contentType,
      'Content-Length': file.data.length,
      'Content-Disposition': `inline; filename="${safeName}"`,
      'Cache-Control': 'private, max-age=3600',
    });
    res.send(file.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
