const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Sign-Up Page
router.get('/signup', (req, res) => {
    res.json({ message: 'Signup page' });
});

// Register
router.post('/signup', async (req, res) => {
    try {
        // Check if user exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Verify password match
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user
        const newUser = new User({
            name: req.body.name,      // Make sure using 'name' not 'username'
            email: req.body.email,
            password: hashedPassword
        });

        // Save user
        const savedUser = await newUser.save();
        res.status(201).json({ id: newUser._id, message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        // Check if user exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: 'Email not found' });
        }

        // Check password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        res.status(200).json({ 
            message: 'Logged in successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add Profile Picture based on Email
router.put('/updateProfilePicture', async (req, res) => {
    const { email, profilePicture } = req.body;

    try {
        // Find user by email and update profile picture
        const updatedUser = await User.findOneAndUpdate(
            { email }, // Match by email
            { profilePicture, updatedAt: Date.now() }, // Update profile picture and timestamp
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

// Add Address (Manual Entry) based on Email
router.put('/AddManualAddress', async (req, res) => {
    const { email, street, city, postalCode } = req.body;

    try {
        // Find user by email and add a new address
        const updatedUser = await User.findOneAndUpdate(
            { email }, // Match by email
            {
                $push: {
                    addresses: { street, city, postalCode } // Push the manual address into the array
                },
                updatedAt: Date.now() // Update the timestamp
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

// Add Location (Map-based) based on Email
router.put('/AddLocation', async (req, res) => {
    const { email, latitude, longitude } = req.body;

    try {
        // Find the user by email
        const updatedUser = await User.findOneAndUpdate(
            { email }, // Match by email
            {
                $push: {
                    addresses: { // Push a new address with coordinates
                        coordinates: {
                            latitude,
                            longitude
                        }
                    }
                },
                updatedAt: Date.now() // Update the timestamp
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
