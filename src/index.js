require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurant'); // Routes pour les restaurants
const menuItemRoutes = require('./routes/menuItem'); // Routes pour les items de menu
const panierRoutes = require('./routes/panier'); // Routes pour le panier

const orderRoutes = require('./routes/order'); // Routes pour les commandes
const reviewRoutes = require('./routes/review'); // Routes pour les critiques
const notificationRoutes = require('./routes/notification');


const app = express();

// Middlewares
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes

app.use('/api/auth', authRoutes); // Authentification
app.use('/api/restaurants', restaurantRoutes); // Restaurants
app.use('/api/menu-items', menuItemRoutes); // Items de menu
app.use('/api/panier', panierRoutes); // Panier
app.use('/api/orders', orderRoutes); // Commandes
app.use('/api/reviews', reviewRoutes); // Critiques


app.use('/api/notifications', notificationRoutes);



// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'API is running. Explore endpoints!',
        documentation: 'https://deliveryfood-backend-yyxy.onrender.com/api/'
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {

    console.log(`Server is running on port : http://127.0.0.1:${PORT}`);

});
