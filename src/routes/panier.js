const express = require('express');
const router = express.Router();
const Panier = require('../models/Panier'); // Assurez-vous que ce fichier correspond bien à votre modèle
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');  // Assurez-vous d'importer le modèle Restaurant

// Fonction pour calculer les frais de livraison en fonction des restaurants dans le panier
const calculateDeliveryFee = async (restaurantIds) => {
    let totalDeliveryFee = 0;

    // Récupérer les informations des restaurants à partir de leurs IDs
    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } });

    // Additionner les frais de livraison de chaque restaurant
    totalDeliveryFee = restaurants.reduce((total, restaurant) => {
        return total + restaurant.deliveryFee;  // Ajouter le frais de livraison du restaurant
    }, 0);

    return totalDeliveryFee;
}

// Ajouter un article au panier (ajout sans remplacement)
router.post('/add-to-cart', async (req, res) => {
    try {
        const { userId, menuItemId, quantity = 1 } = req.body;

        // Vérifier l'existence de l'utilisateur et de l'article
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        // Récupérer ou créer le panier
        let cart = await Panier.findOne({ userId });
        if (!cart) {
            cart = new Panier({
                userId,
                total: 0,
                restaurantIds: [],
                itemQuantities: [],
                status: 'open',
            });
        }

        // Vérifier si l'article existe déjà
        const existingItemIndex = cart.itemQuantities.findIndex(item => item.menuItemId.toString() === menuItemId);
        if (existingItemIndex !== -1) {
            cart.itemQuantities[existingItemIndex].quantity += quantity;
        } else {
            cart.itemQuantities.push({ menuItemId, quantity });
        }

        // Peupler les détails des articles de menu
        const populatedItems = await MenuItem.find({
            _id: { $in: cart.itemQuantities.map(item => item.menuItemId) }
        });

        // Mettre à jour la liste des restaurants dans le panier
        cart.restaurantIds = [...new Set(
            populatedItems.map(item => item.restaurant.toString())
        )];

        // Recalculer le total du panier
        cart.total = cart.itemQuantities.reduce((total, item) => {
            const menuItem = populatedItems.find(menu => menu._id.toString() === item.menuItemId.toString());
            return menuItem ? total + menuItem.price * item.quantity : total;
        }, 0);

        // Calculer les frais de livraison
        cart.deliveryFee = await calculateDeliveryFee(cart.restaurantIds);

        // Sauvegarder le panier mis à jour
        await cart.save();
        res.json({ message: "Item added to cart", cart });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'ajout de l'article au panier", error: error.message });
    }
});

// Retourner le panier de l'utilisateur
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const panier = await Panier.findOne({ userId })
            .populate('itemQuantities.menuItemId'); // Seul itemQuantities est peuplé maintenant

        if (!panier) {
            return res.status(404).json({ message: 'Panier non trouvé' });
        }

        res.status(200).json(panier);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du panier', error });
    }
});

// Supprimer un article du panier
router.post('/remove-from-cart', async (req, res) => {
    try {
        const { userId, menuItemId } = req.body;

        // Récupérer le panier de l'utilisateur
        let cart = await Panier.findOne({ userId }).populate('itemQuantities.menuItemId');

        if (!cart) {
            return res.status(404).json({ message: "Panier non trouvé" });
        }

        // Trouver l'index de l'article à supprimer
        const itemIndex = cart.itemQuantities.findIndex(item => 
            item.menuItemId && item.menuItemId._id.toString() === menuItemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Supprimer l'article du panier
        const removedItem = cart.itemQuantities.splice(itemIndex, 1);
        const menuItem = await MenuItem.findById(menuItemId);

        // Mettre à jour le total
        if (menuItem) {
            cart.total -= removedItem[0].quantity * menuItem.price;
        }

        // Mettre à jour les restaurants restants
        const remainingItems = await MenuItem.find({
            _id: { $in: cart.itemQuantities.map(item => item.menuItemId._id) }
        });

        cart.restaurantIds = [...new Set(remainingItems.map(item => item.restaurant.toString()))];

        // Recalculer les frais de livraison
        cart.deliveryFee = await calculateDeliveryFee(cart.restaurantIds);

        // Sauvegarder le panier mis à jour
        await cart.save();

        res.json({ message: "Item removed from cart", cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'article", error: error.message });
    }
});

router.post('/update-item-quantity', async (req, res) => {
    try {
        const { userId, menuItemId, quantity } = req.body;

        if (!menuItemId || typeof menuItemId !== 'string') {
            return res.status(400).json({ message: "menuItemId invalide ou manquant" });
        }

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: "Quantité invalide" });
        }

        // Récupérer le panier avec les données peuplées
        let cart = await Panier.findOne({ userId }).populate('itemQuantities.menuItemId');

        if (!cart) {
            return res.status(404).json({ message: "Panier non trouvé" });
        }

        // Vérifier si l'article existe dans le panier
        const itemIndex = cart.itemQuantities.findIndex(item => 
            item.menuItemId && item.menuItemId._id.toString() === menuItemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Mettre à jour la quantité de l'article
        cart.itemQuantities[itemIndex].quantity = quantity;

        // Recalculer le total
        const allMenuItems = await MenuItem.find({ 
            _id: { $in: cart.itemQuantities.map(item => item.menuItemId._id) }
        });

        cart.total = cart.itemQuantities.reduce((total, item) => {
            const menuItem = allMenuItems.find(menu => 
                menu._id.toString() === item.menuItemId._id.toString()
            );
            return menuItem ? total + (menuItem.price * item.quantity) : total;
        }, 0);

        // Mettre à jour les restaurants
        cart.restaurantIds = [...new Set(allMenuItems.map(item => item.restaurant.toString()))];

        // Recalculer les frais de livraison
        cart.deliveryFee = await calculateDeliveryFee(cart.restaurantIds);

        // Sauvegarder le panier mis à jour
        await cart.save();

        res.json({ message: "Quantity updated", cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la quantité", error: error.message });
    }
});


module.exports = router;
