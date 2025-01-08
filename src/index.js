const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
<<<<<<< HEAD
=======
const restaurantRoutes = require('./routes/restaurant'); // Routes pour les restaurants
const menuItemRoutes = require('./routes/menuItem'); // Routes pour les items de menu
const panierRoutes = require('./routes/panier'); // Routes pour le panier
const orderRoutes = require('./routes/order'); // Importation des routes pour les commandes
>>>>>>> Chemsou

const app = express();

// Middlewares
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
<<<<<<< HEAD
=======
app.use('/api/restaurants', restaurantRoutes); // Routes pour les restaurants
app.use('/api/menu-items', menuItemRoutes); // Routes pour les items de menu
app.use('/api/panier', panierRoutes); // Routes pour le panier
app.use('/api/orders', orderRoutes); // Ajout des routes pour les commandes
>>>>>>> Chemsou

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

<<<<<<< HEAD

// Your existing POST routes remain the 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
=======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port : https://deliveryfood-backend-yyxy.onrender.com:${PORT}`);
});
>>>>>>> Chemsou
