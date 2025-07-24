// Load environment variables
require('dotenv').config();

// Core imports
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const speech = require('@google-cloud/speech');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Models
const Transcription = require('./models/Transcription');
const User = require('./models/User');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Google Speech Client
const speechClient = new speech.SpeechClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth Middleware
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ error: 'User not found.' });

    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized access.' });
  }
};

// Multer setup for audio uploads
const uploadMiddleware = (req, res, next) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: (req, file, cb) => {
      file.mimetype.startsWith('audio/')
        ? cb(null, true)
        : cb(new Error('Only audio files allowed'), false);
    }
  }).single('audio');

  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'Upload failed', details: err.message });
    next();
  });
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) return res.status(400).json({ error: 'All fields required.' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists.' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hash });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ _id: user._id, username: user.username, token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.', details: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    const isMatch = user && await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ _id: user._id, username: user.username, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.', details: err.message });
  }
});

// --- Transcription Routes ---
app.get('/api/transcriptions', protect, async (req, res) => {
  try {
    const items = await Transcription.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transcriptions.' });
  }
});

app.post('/api/transcribe', protect, uploadMiddleware, async (req, res) => {
  const { language, sourceType } = req.body;

  if (!req.file) return res.status(400).json({ error: 'No audio file uploaded.' });

  try {
    const projectId = await speechClient.getProjectId();
    const audioBytes = req.file.buffer.toString('base64');

    const config = {
      languageCode: language,
      model: 'latest_long',
      enableAutomaticPunctuation: true,
      adaptation: {
        phraseSets: [{
          name: `projects/${projectId}/locations/global/phraseSets/project-jargon`,
          phrases: [
            { value: "MERN stack", boost: 20 },
            { value: "MongoDB", boost: 20 },
            { value: "Express.js", boost: 20 },
            { value: "React", boost: 20 },
            { value: "Node.js", boost: 20 }
          ]
        }]
      }
    };

    const encodingMap = {
      'audio/webm': 'WEBM_OPUS',
      'audio/ogg': 'WEBM_OPUS',
      'audio/wav': 'LINEAR16',
      'audio/mpeg': 'MP3',
      'audio/flac': 'FLAC',
    };

    config.encoding = encodingMap[req.file.mimetype] || 'ENCODING_UNSPECIFIED';
    if (config.encoding === 'WEBM_OPUS') config.sampleRateHertz = 48000;

    const [response] = await speechClient.recognize({
      audio: { content: audioBytes },
      config
    });

    const transcription = response.results?.map(r => r.alternatives[0].transcript).join('\n') || '[No speech detected]';

    const newTranscription = await Transcription.create({
      fileName: req.file.originalname,
      transcriptionText: transcription,
      language,
      sourceType,
      user: req.user._id
    });

    res.status(201).json(newTranscription);
  } catch (error) {
    console.error("❌ Transcribe error:", error.message);
    res.status(500).json({ error: 'Transcription failed.', details: error.message });
  }
});

app.delete('/api/transcriptions/:id', protect, async (req, res) => {
  try {
    const item = await Transcription.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Transcription not found.' });
    if (item.user.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized.' });

    await item.deleteOne();
    res.json({ message: 'Deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed.' });
  }
});

// --- Serve Client in Production ---
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../client/build');
  app.use(express.static(clientPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
