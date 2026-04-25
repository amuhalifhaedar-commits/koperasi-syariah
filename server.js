const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static('frontend'));

// Routes Imports
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const anggotaRoutes = require('./routes/anggota');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/anggota', anggotaRoutes);

// Fallback route for frontend Single Page Application (optional, if we use pure HTML, we don't strictly need it, but good for redirecting unknown APIs)
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API Route Not Found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
