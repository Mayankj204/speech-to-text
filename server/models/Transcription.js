const mongoose = require('mongoose');

// Defines the structure of documents in the 'transcriptions' collection
const transcriptionSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
    },
    transcriptionText: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    sourceType: {
        type: String,
        required: true,
        enum: ['upload', 'record'], // The source can only be one of these two values
    },
    // This field links the transcription to a specific user.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation date
    },
});

const Transcription = mongoose.model('Transcription', transcriptionSchema);

module.exports = Transcription;
