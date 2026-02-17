const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const env = require('dotenv');
const path = require('path');

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

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB connection failed:", err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/applications', require('./routes/appRoutes'));

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

app.listen(PORT, () => {
    console.log(` Server running on PORT: ${PORT}`);
});