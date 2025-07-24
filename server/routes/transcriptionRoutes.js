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
    const { fileName, transcriptionText, method } = req.body;

    if (!fileName || !transcriptionText || !method) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newTranscription = new Transcription({
      fileName,
      transcriptionText,
      method,
    });

    await newTranscription.save();
    res.status(201).json(newTranscription);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save transcription.' });
  }
});

module.exports = router;
