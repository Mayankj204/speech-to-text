const mongoose = require('mongoose');

// Defines the structure for documents in the 'users' collection
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true, // Each username must be unique
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long']
    }
}, {
    // Automatically add 'createdAt' and 'updatedAt' fields
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
