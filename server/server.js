// Load environment variables from .env
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

// App setup
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Google Cloud Speech client
const speechClient = new speech.SpeechClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
  }
  return res.status(401).json({ error: 'No token provided.' });
};

// Multer middleware for audio upload
const uploadMiddleware = (req, res, next) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files allowed'), false);
      }
    },
  }).single('audio');

  upload(req, res, err => {
    if (err) return res.status(400).json({ error: 'Upload error', details: err.message });
    next();
  });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) return res.status(400).json({ error: 'All fields required.' });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username taken.' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hash });

    res.status(201).json({
      _id: user.id,
      username: user.username,
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.', details: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        _id: user.id,
        username: user.username,
        token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
      });
    }
    res.status(401).json({ error: 'Invalid credentials.' });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.', details: err.message });
  }
});

// Transcription routes
app.get('/api/transcriptions', protect, async (req, res) => {
  try {
    const items = await Transcription.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch transcriptions.' });
  }
});

app.post('/api/transcribe', protect, uploadMiddleware, async (req, res) => {
  const { language, sourceType } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No audio uploaded.' });

  try {
    const projectId = await speechClient.getProjectId();
    const audioBytes = req.file.buffer.toString('base64');

    const encodingMap = {
      'audio/webm': 'WEBM_OPUS',
      'audio/ogg': 'WEBM_OPUS',
      'audio/wav': 'LINEAR16',
      'audio/mpeg': 'MP3',
      'audio/flac': 'FLAC',
    };

    const config = {
      languageCode: language,
      model: 'latest_long',
      enableAutomaticPunctuation: true,
      encoding: encodingMap[req.file.mimetype] || 'ENCODING_UNSPECIFIED',
      ...(req.file.mimetype === 'audio/webm' || req.file.mimetype === 'audio/ogg'
        ? { sampleRateHertz: 48000 }
        : {}),
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

    const [response] = await speechClient.recognize({
      audio: { content: audioBytes },
      config
    });

    const text = response.results?.map(r => r.alternatives[0].transcript).join('\n') || '[No speech detected]';

    const newT = await Transcription.create({
      fileName: req.file.originalname,
      transcriptionText: text,
      language,
      sourceType,
      user: req.user.id
    });

    res.status(201).json(newT);
  } catch (error) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: 'Transcription failed.', details: error.message });
  }
});

app.delete('/api/transcriptions/:id', protect, async (req, res) => {
  try {
    const item = await Transcription.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found.' });
    if (item.user.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });

    await item.deleteOne();
    res.json({ message: 'Deleted successfully.' });
  } catch {
    res.status(500).json({ error: 'Delete failed.' });
  }
});

// Static file serving for deployment
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
