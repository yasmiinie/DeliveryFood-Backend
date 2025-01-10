const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Panier = require('../models/Panier'); // Assurez-vous que Panier est correctement importé

// Ajouter une critique
router.post('/', async (req, res) => {
    const { userId, orderId, rating, comment } = req.body;

    try {
        console.log('Début de la création de la critique');
        console.log('Requête reçue avec les données :', { userId, orderId, rating, comment });

        // Vérifier que la commande existe
        const order = await Order.findById(orderId);
        if (!order) {
            console.log('Commande introuvable pour orderId :', orderId);
            return res.status(404).json({ message: 'Order not found' });
        }
        console.log('Commande trouvée :', order);

        // Vérifier que l'utilisateur correspond
        if (order.userId.toString() !== userId) {
            console.log('Utilisateur non autorisé à évaluer cette commande. UserId attendu :', order.userId);
            return res.status(403).json({ message: 'Unauthorized to review this order' });
        }

        // Vérifier que l'ID du panier est valide
        if (!mongoose.Types.ObjectId.isValid(order.panierId)) {
            console.log('ID de panier invalide :', order.panierId);
            return res.status(400).json({ message: 'Invalid panier ID' });
        }

        // Récupérer le panier lié à la commande
        const panier = await Panier.findById(order.panierId);
        if (!panier) {
            console.log('Panier introuvable pour panierId :', order.panierId);
            return res.status(404).json({ message: 'Panier not found for this order' });
        }
        console.log('Panier trouvé :', panier);

        // Vérifier que le panier contient au moins un restaurant
        if (!panier.restaurantIds || panier.restaurantIds.length === 0) {
            console.log('Aucun restaurant associé au panier :', panier);
            return res.status(404).json({ message: 'No restaurant associated with this order' });
        }

        // Sélectionner le premier restaurant (ou une autre logique si nécessaire)
        const restaurantId = panier.restaurantIds[0];
        console.log('Restaurant associé trouvé :', restaurantId);

        // Vérifier que le restaurant existe
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            console.log('Restaurant introuvable pour restaurantId :', restaurantId);
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        console.log('Restaurant trouvé :', restaurant);

        // Ajouter la critique
        const newReview = new Review({ userId, orderId, restaurantId, rating, comment });
        await newReview.save();
        console.log('Critique ajoutée :', newReview);

        // Mettre à jour la note moyenne et le nombre d'évaluations du restaurant
        const newCount = restaurant.rating.count + 1;
        const newAverage =
            (restaurant.rating.average * restaurant.rating.count + rating) / newCount;

        restaurant.rating.count = newCount;
        restaurant.rating.average = newAverage;
        await restaurant.save();
        console.log('Évaluation du restaurant mise à jour :', restaurant.rating);

        res.status(201).json({
            message: 'Review added and restaurant rating updated',
            review: newReview,
            restaurant: {
                averageRating: restaurant.rating.average,
                totalReviews: restaurant.rating.count,
            },
        });
    } catch (error) {
        console.error('Erreur serveur :', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
