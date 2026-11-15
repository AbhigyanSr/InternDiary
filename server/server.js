// Load env variables before anything reads process.env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { startNewsCron, stopNewsCron, isNewsCronEnabled } = require('./utils/newsCron');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: CLIENT_URL may hold one or more comma-separated frontend origins,
// e.g. "https://intern-diary.vercel.app,https://www.example.com".
// Set ALLOW_VERCEL_PREVIEWS=true to also allow any https://*.vercel.app origin.
const allowedOrigins = [
  'http://localhost:3000',
  ...(process.env.CLIENT_URL || '').split(','),
]
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server, same-origin file links)
    if (!origin) return callback(null, true);
    const allowed =
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV === 'development' ||
      (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && /^https:\/\/[\w-]+\.vercel\.app$/.test(origin));
    if (!allowed) console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, allowed);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Legacy files uploaded to local disk before uploads moved to MongoDB
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/applications', require('./routes/appRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));

// Resume Upload Route
const { protect } = require('./middleware/authMiddleware');
const upload = require('./middleware/uploadMiddleware');
const User = require('./models/User');
const { saveUploadedFile, deleteStoredFileByPath } = require('./utils/fileStorage');

app.post('/api/user/resume', protect, upload.singleWithErrors('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const previousPath = req.user.resumePath;
    const resumePath = await saveUploadedFile(req.file, { owner: req.user._id, kind: 'resume' });
    const user = await User.findByIdAndUpdate(req.user.id, { resumePath }, { new: true });
    if (previousPath && previousPath !== resumePath) {
      deleteStoredFileByPath(previousPath).catch((error) => console.error('Old resume cleanup failed:', error.message));
    }
    res.json({ message: 'Resume uploaded successfully', path: user.resumePath });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('API is running.');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Unknown API routes return JSON instead of Express's HTML page
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Central error handler: always respond with JSON
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });
  if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ message: err.message });
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

let server;

async function shutdown(signal) {
  stopNewsCron();
  if (server) await new Promise((resolve) => server.close(resolve));
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  console.log(`Server shut down after ${signal}`);
}

// Listen immediately so the host's health check passes even while MongoDB connects.
server = app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    if (isNewsCronEnabled()) {
      try {
        startNewsCron();
        console.log(`News cron started with schedule ${process.env.NEWS_CRON_SCHEDULE || '0 * * * *'}`);
      } catch (error) {
        console.error('News cron failed to start:', error.message);
      }
    } else {
      console.log('News cron is disabled');
    }
  })
  .catch((err) => console.error('MongoDB connection failed:', err.message));

process.once('SIGINT', () => { shutdown('SIGINT').finally(() => process.exit(0)); });
process.once('SIGTERM', () => { shutdown('SIGTERM').finally(() => process.exit(0)); });
