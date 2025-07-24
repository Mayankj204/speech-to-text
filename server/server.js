// Load environment variables from a .env file
require('dotenv').config();

// Import necessary packages
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const speech = require('@google-cloud/speech');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path'); // Import the 'path' module

// Import Mongoose Models
const Transcription = require('./models/Transcription');
const User = require('./models/User');

// --- Basic Server Setup ---
const app = express();
const PORT = process.env.PORT || 3001;

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Initialize Google Speech Client ---
const speechClient = new speech.SpeechClient();

// --- Middleware ---
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Authentication Middleware (to protect routes) ---
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Not authorized, token failed.' });
        }
    }
    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token.' });
    }
};

// --- File Upload Middleware ---
const uploadMiddleware = (req, res, next) => {
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 25 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('audio/')) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only audio files are permitted.'), false);
            }
        }
    }).single('audio');

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: 'File Upload Error', details: err.message });
        }
        next();
    });
};


// --- API ROUTES ---

app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ error: 'Please enter all fields.' });
        }
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ error: 'Username already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ username, password: hashedPassword });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
            });
        } else {
            res.status(400).json({ error: 'Invalid user data.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration.', details: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
     const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                username: user.username,
                token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
            });
        } else {
            res.status(401).json({ error: 'Invalid username or password.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error during login.', details: error.message });
    }
});

app.get('/api/transcriptions', protect, async (req, res) => {
    try {
        const transcriptions = await Transcription.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(transcriptions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve transcriptions.' });
    }
});

app.post('/api/transcribe', protect, uploadMiddleware, async (req, res) => {
    const { language, sourceType } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded.' });
    if (!language) return res.status(400).json({ error: 'No language selected.' });

    try {
        const projectId = await speechClient.getProjectId();
        const audioBytes = req.file.buffer.toString('base64');
        const audio = { content: audioBytes };

        const getRecognitionConfig = (mimetype) => {
            const baseConfig = {
                languageCode: language,
                model: 'latest_long',
                enableAutomaticPunctuation: true,
                adaptation: {
                    phraseSets: [{
                        name: `projects/${projectId}/locations/global/phraseSets/project-jargon`,
                        phrases: [
                            { value: "MERN stack", boost: 20 }, { value: "MongoDB", boost: 20 },
                            { value: "Express.js", boost: 20 }, { value: "React", boost: 20 },
                            { value: "Node.js", boost: 20 }
                        ]
                    }]
                }
            };
            
            if (mimetype === 'audio/webm' || mimetype === 'audio/ogg') {
                return { ...baseConfig, encoding: 'WEBM_OPUS', sampleRateHertz: 48000 };
            } else if (mimetype === 'audio/wav') {
                return { ...baseConfig, encoding: 'LINEAR16' };
            } else if (mimetype === 'audio/mpeg') {
                return { ...baseConfig, encoding: 'MP3' };
            } else if (mimetype === 'audio/flac') {
                return { ...baseConfig, encoding: 'FLAC' };
            }
            
            return { ...baseConfig, encoding: 'ENCODING_UNSPECIFIED' };
        };

        const config = getRecognitionConfig(req.file.mimetype);
        const request = { audio, config };

        const [response] = await speechClient.recognize(request);
        
        let transcriptionText = '[No speech detected]';
        if (response.results?.length > 0 && response.results[0].alternatives?.length > 0) {
            transcriptionText = response.results.map(result => result.alternatives[0].transcript).join('\n');
        }
        
        const newTranscription = new Transcription({
            fileName: req.file.originalname,
            transcriptionText: transcriptionText,
            language: language,
            sourceType: sourceType,
            user: req.user.id
        });
        
        await newTranscription.save();
        res.status(201).json(newTranscription);

    } catch (error) {
        res.status(500).json({ error: 'An error occurred on the server.', details: error.message });
    }
});

app.delete('/api/transcriptions/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const transcription = await Transcription.findById(id);
        if (!transcription) {
            return res.status(404).json({ error: 'Transcription not found.' });
        }
        if (transcription.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'User not authorized to delete this item.' });
        }
        await transcription.deleteOne();
        res.status(200).json({ message: 'Transcription deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete transcription.' });
    }
});


// --- DEPLOYMENT: SERVE STATIC ASSETS ---
if (process.env.NODE_ENV === 'production') {
    // NOTE: Your build log shows you are using 'react-scripts', which outputs to a 'build' folder.
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
    });
}


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
