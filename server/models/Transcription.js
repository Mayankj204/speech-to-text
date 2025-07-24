const mongoose = require('mongoose');

const transcriptionSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  transcriptionText: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  method: {
    type: String,
    enum: ['upload', 'record'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Transcription', transcriptionSchema);
