const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Votre modèle utilisateur

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://deliveryfood-backend-yyxy.onrender.com/api/auth/google/callback",
    scope: ['profile', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Rechercher ou créer l'utilisateur dans la base de données
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value, // Google retourne un tableau d'emails
                profilePicture: profile.photos[0].value // Photo de profil Google
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

// Sérialisation utilisateur dans la session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Désérialisation utilisateur depuis la session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
