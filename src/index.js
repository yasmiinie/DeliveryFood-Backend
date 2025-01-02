const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurant'); // Add this line

const app = express();

// Middlewares
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes); // Add this line

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});