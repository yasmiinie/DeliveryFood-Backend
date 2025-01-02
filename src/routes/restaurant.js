const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');

// Get all restaurants
router.get('/', async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ isActive: true });
        res.status(200).json(restaurants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Homepage route for nearby restaurants with the best ratings
// Homepage route for nearby restaurants with the best ratings
router.get('/nearby-top', async (req, res) => {
    try {
        const { latitude, longitude, limit = 10 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const restaurants = await Restaurant.find({
            isActive: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: 5000 // 5km radius
                }
            }
        })
        .sort({ 'rating.average': -1 })
        .limit(parseInt(limit));

        res.status(200).json(restaurants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Search route with filters
router.get('/search', async (req, res) => {
    try {
        const {
            searchText,
            deliveryTimeMax,
            minRating,
            cuisineType,
            page = 1,
            limit = 10
        } = req.query;

        let query = { isActive: true };

        if (searchText) {
            query.$or = [
                { name: { $regex: searchText, $options: 'i' } },
                { keywords: { $regex: searchText, $options: 'i' } },
                { description: { $regex: searchText, $options: 'i' } }
            ];
        }

        if (deliveryTimeMax) {
            query['deliveryTime.max'] = { $lte: parseInt(deliveryTimeMax) };
        }

        if (minRating) {
            query['rating.average'] = { $gte: parseFloat(minRating) };
        }

        if (cuisineType) {
            query.cuisineType = cuisineType;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const restaurants = await Restaurant.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ 'rating.average': -1 });

        const total = await Restaurant.countDocuments(query);

        res.status(200).json({
            restaurants,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get restaurant by ID
router.get('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({
            _id: req.params.id,
            isActive: true
        });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.status(200).json(restaurant);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new restaurant
router.post('/', async (req, res) => {
    try {
        const restaurant = new Restaurant({
            name: req.body.name,
            logo: req.body.logo,
            coverImage: req.body.coverImage,
            description: req.body.description,
            cuisineType: req.body.cuisineType,
            address: {
                street: req.body.address?.street,
                city: req.body.address?.city,
                postalCode: req.body.address?.postalCode
            },
            coordinates: {
                latitude: req.body.coordinates?.latitude,
                longitude: req.body.coordinates?.longitude
            },
            contactInfo: {
                phone: req.body.contactInfo?.phone,
                email: req.body.contactInfo?.email
            },
            socialMedia: {
                facebook: req.body.socialMedia?.facebook,
                instagram: req.body.socialMedia?.instagram,
                twitter: req.body.socialMedia?.twitter
            },
            openingHours: req.body.openingHours,
            deliveryTime: {
                min: req.body.deliveryTime?.min || 30,
                max: req.body.deliveryTime?.max || 45
            },
            keywords: req.body.keywords,
            rating: {
                average: req.body.rating?.average || 0,
                count: req.body.rating?.count || 0
            },
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        });

        const newRestaurant = await restaurant.save();

        res.status(201).json(newRestaurant);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update restaurant
router.put('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        res.status(200).json(restaurant);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete restaurant
router.delete('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        res.status(200).json({ message: 'Restaurant deactivated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
