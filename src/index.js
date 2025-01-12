require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurant');
const menuItemRoutes = require('./routes/menuItem');
const panierRoutes = require('./routes/panier');
const orderRoutes = require('./routes/order');
const reviewRoutes = require('./routes/review');
const notificationRoutes = require('./routes/notification');
require('./config/passport'); // Charger la configuration Passport

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares globaux
app.use(express.json()); // Parse les requêtes JSON

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized. Please log in.' });
}


// Configuration des sessions
app.use(session({
    secret: 'secret', // Utilisation de la clé sécurisée
    resave: false,
    saveUninitialized: true,
}));

// Middleware Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/panier', panierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// Route de base
app.get('/', (req, res) => {
    res.json({
        message: 'API is running. Explore endpoints!',
        documentation: 'https://deliveryfood-backend-yyxy.onrender.com/api/',
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port : http://127.0.0.1:${PORT}`);
});
