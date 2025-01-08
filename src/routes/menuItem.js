const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Create new menu item
router.post('/', async (req, res) => {
    try {
        const menuItem = new MenuItem(req.body);
        const savedMenuItem = await menuItem.save();
        res.status(201).json(savedMenuItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all menu items for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {
            restaurant: req.params.restaurantId,
            isAvailable: true
        };

        if (category) {
            query.category = category;
        }

        const menuItems = await MenuItem.find(query)
            .sort({ category: 1, name: 1 });

        res.status(200).json(menuItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search menu items with filters
router.get('/search', async (req, res) => {
    try {
        const { searchText, maxPrice, rating } = req.query;

        // Base query
        let query = {};

        // Filter by searchText (name or description)
        if (searchText) {
            query.$or = [
                { name: { $regex: searchText, $options: 'i' } },
                { description: { $regex: searchText, $options: 'i' } }
            ];
        }

        // Filter by maxPrice
        if (maxPrice) {
            query.price = { $lte: parseFloat(maxPrice) };
        }

        // Filter by rating
        if (rating) {
            query.rating = { $gte: parseFloat(rating) };
        }

        // Fetch results
        const menuItems = await MenuItem.find(query)
            .sort({ price: 1, name: 1 });

        res.status(200).json(menuItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get specific menu item
router.get('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json(menuItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update menu item
router.put('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.status(200).json(menuItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete menu item (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        menuItem.isAvailable = false;
        await menuItem.save();

        res.status(200).json({ message: 'Menu item deactivated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
