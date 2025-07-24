const mongoose = require('mongoose');

const transcriptionSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  transcriptionText: { type: String, required: true },
  method: {
    type: String,
    enum: ['upload', 'record'],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Transcription', transcriptionSchema);
