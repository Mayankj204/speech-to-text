const express = require('express');
const router = express.Router();
const Transcription = require('../models/Transcription');

// Get all transcriptions
router.get('/', async (req, res) => {
  try {
    const transcriptions = await Transcription.find();
    res.json(transcriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new transcription
router.post('/', async (req, res) => {
  try {
    const { fileName, transcriptionText, method } = req.body;
    const newT = new Transcription({
      fileName,
      transcriptionText,
      method,
    });
    await newT.save();
    res.status(201).json(newT);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
