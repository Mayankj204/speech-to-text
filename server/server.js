require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const transcriptionRoutes = require('./routes/transcriptionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/transcription', transcriptionRoutes);

// Serve frontend
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
