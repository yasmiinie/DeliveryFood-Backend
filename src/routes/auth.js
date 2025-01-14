const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// Sign-Up Page
router.get('/signup', (req, res) => {
    res.json({ message: 'Signup page' });
});

// Register
router.post('/signup', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();
        res.status(201).json({ id: newUser._id, message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: 'Email not found' });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        res.status(200).json({
            message: 'Logged in successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Fetch user info
router.post('/userinfo', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.id });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Fetching successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                addresses: user.addresses,
                bio: user.bio || "null",
                phoneNumber: user.phoneNumber || "null",
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user info
router.put('/updateUserInfo', async (req, res) => {
    try {
        const { id, name, email, profilePicture, addresses, bio, phoneNumber } = req.body;

        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (profilePicture) updateFields.profilePicture = profilePicture;
        if (addresses) updateFields.addresses = addresses;
        if (bio) updateFields.bio = bio;
        if (phoneNumber) updateFields.phoneNumber = phoneNumber;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { ...updateFields, updatedAt: new Date() },
            { new: true }
        );

        res.status(200).json({
            message: 'User info updated successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture,
                addresses: updatedUser.addresses,
                bio: updatedUser.bio || "null",
                phoneNumber: updatedUser.phoneNumber || "null",
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user info' });
    }
});

// Add Profile Picture
router.put('/updateProfilePicture', async (req, res) => {
    const { id, profilePicture } = req.body;

    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: id },
            { profilePicture, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile picture updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile picture' });
    }
});

// Google OAuth Routes
// Initiate Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth Callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const userId = req.user._id;
        res.redirect('myapp://auth/google/callback');    }
);

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.redirect('/');
    });
});

// Add Address
router.put('/AddManualAddress', async (req, res) => {
    const { email, street, city, postalCode } = req.body;

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email },
            {
                $push: {
                    addresses: { street, city, postalCode },
                },
                updatedAt: Date.now(),
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Manual Address added successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error adding manual address' });
    }
});

// Add Location
router.put('/AddLocation', async (req, res) => {
    const { email, latitude, longitude } = req.body;

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email },
            {
                $push: {
                    addresses: {
                        coordinates: { latitude, longitude },
                    },
                },
                updatedAt: Date.now(),
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Location added successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error adding location' });
    }
});

module.exports = router;
