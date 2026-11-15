const mongoose = require('mongoose');
const StoredFile = require('../models/StoredFile');

const FILE_PATH_PREFIX = '/api/files/';

async function saveUploadedFile(file, { owner, kind }) {
  const stored = await StoredFile.create({
    owner,
    kind,
    filename: file.originalname || `${kind}.pdf`,
    contentType: file.mimetype || 'application/pdf',
    size: file.size || file.buffer.length,
    data: file.buffer,
  });
  return `${FILE_PATH_PREFIX}${stored._id}`;
}

function storedFileIdFromPath(filePath) {
  if (typeof filePath !== 'string' || !filePath.startsWith(FILE_PATH_PREFIX)) return null;
  const id = filePath.slice(FILE_PATH_PREFIX.length);
  return mongoose.isValidObjectId(id) ? id : null;
}

async function deleteStoredFileByPath(filePath) {
  const id = storedFileIdFromPath(filePath);
  if (id) await StoredFile.deleteOne({ _id: id });
}

module.exports = { FILE_PATH_PREFIX, saveUploadedFile, storedFileIdFromPath, deleteStoredFileByPath };
