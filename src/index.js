const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurant'); // Routes pour les restaurants
const menuItemRoutes = require('./routes/menuItem'); // Routes pour les items de menu
const panierRoutes = require('./routes/panier'); // Routes pour le panier
const orderRoutes = require('./routes/order'); // Importation des routes pour les commandes
const notificationRoutes = require('./routes/notification');
const app = express();

// Middlewares
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes

app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes); // Routes pour les restaurants
app.use('/api/menu-items', menuItemRoutes); // Routes pour les items de menu
app.use('/api/panier', panierRoutes); // Routes pour le panier
app.use('/api/orders', orderRoutes); // Ajout des routes pour les commandes

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port : http://127.0.0.1:${PORT}`);
});
