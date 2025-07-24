const express = require('express');
const router = express.Router();
const Transcription = require('../models/Transcription');

// @route   GET /api/transcription
// @desc    Get all transcriptions
router.get('/', async (req, res) => {
  try {
    const transcriptions = await Transcription.find().sort({ createdAt: -1 }); // latest first
    res.json(transcriptions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transcriptions.' });
  }
});

// @route   POST /api/transcription
// @desc    Create a new transcription
router.post('/', async (req, res) => {
  try {
    const { fileName, transcriptionText, method, userId } = req.body;

    // Validate required fields
    if (!fileName || !transcriptionText || !method || !userId) {
      return res.status(400).json({ error: 'All fields are required: fileName, transcriptionText, method, userId.' });
    }

    // Create and save transcription
    const newTranscription = new Transcription({
      fileName,
      transcriptionText,
      method,
      user: userId
    });

    await newTranscription.save();
    res.status(201).json(newTranscription);
  } catch (err) {
    console.error(err); // log full error
    res.status(500).json({ error: 'Failed to save transcription.' });
  }
});

module.exports = router;
