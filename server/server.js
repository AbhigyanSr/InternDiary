const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const env = require('dotenv');
const path = require('path');
const { startNewsCron, stopNewsCron, isNewsCronEnabled } = require('./utils/newsCron');

// Load Env variables
env.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
  // Add your Vercel deployment URL here
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Serve uploads folder statically so frontend can access PDF links
// Access via: http://localhost:5000/uploads/filename.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let server;

async function shutdown(signal) {
  stopNewsCron();
  if (server) await new Promise((resolve) => server.close(resolve));
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  console.log(`Server shut down after ${signal}`);
}

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB Connected");
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

      server = app.listen(PORT, () => {
        console.log(` Server running on PORT: ${PORT}`);
      });
    })
    .catch((err) => console.error("MongoDB connection failed:", err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/applications', require('./routes/appRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
// Resume Upload Route
// Note: Changed from { upload } to upload to match your module.exports
const { protect } = require('./middleware/authMiddleware');
const upload = require('./middleware/uploadMiddleware');
const User = require('./models/User');

app.post('/api/user/resume', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resumePath: req.file.path },
      { new: true }
    );
    res.json({ message: 'Resume uploaded successfully', path: user.resumePath });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

app.get('/', (req, res) => {
    res.send("API is running.");
});

process.once('SIGINT', () => { shutdown('SIGINT').finally(() => process.exit(0)); });
process.once('SIGTERM', () => { shutdown('SIGTERM').finally(() => process.exit(0)); });