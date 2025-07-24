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
        type: mongoose.Schema.Types.ObjectId, // This will store the user's unique ID
        ref: 'User', // This creates a reference to the User model
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation date
    },
});

// Create a Mongoose model based on the schema
const Transcription = mongoose.model('Transcription', transcriptionSchema);

module.exports = Transcription;
