const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Panier = require('../models/Panier'); // Assurez-vous que Panier est correctement importés
const User = require('../models/User'); // Importation du modèle User


// Ajouter une critique

router.post('/', async (req, res) => {
    const { userId, restaurantId, rating, comment } = req.body; // Replace orderId with restaurantId

    try {
        console.log('Début de la création de la critique');
        console.log('Requête reçue avec les données :', { userId, restaurantId, rating, comment });

        // Vérifier que le restaurant existe
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            console.log('Restaurant introuvable pour restaurantId :', restaurantId);
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        console.log('Restaurant trouvé :', restaurant);

        // Ajouter la critique
        const newReview = new Review({ userId, restaurantId, rating, comment }); // Remove orderId
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
// Vérifier si l'utilisateur a déjà laissé une critique pour cette commande
router.get('/check/:userId/:orderId', async (req, res) => {
    const { userId, orderId } = req.params;

    try {
        const existingReview = await Review.findOne({ userId, orderId });
        if (existingReview) {
            return res.status(400).json({ message: 'Review already exists for this order' });
        }

        res.status(200).json({ message: 'No review found for this order' });
    } catch (error) {
        console.error('Erreur serveur :', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Supprimer une critique
router.delete('/:reviewId', async (req, res) => {
    const { reviewId } = req.params;

    try {
        const review = await Review.findByIdAndDelete(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Mettre à jour le score du restaurant après suppression
        const restaurant = await Restaurant.findById(review.restaurantId);
        if (restaurant) {
            restaurant.rating.count -= 1;
            restaurant.rating.average = (restaurant.rating.average * (restaurant.rating.count + 1) - review.rating) / restaurant.rating.count;
            await restaurant.save();
        }

        res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la critique :', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Récupérer les critiques d'un restaurant avec les infos de l'utilisateur
router.get('/:restaurantId/', async (req, res) => {
    const { restaurantId } = req.params;

    try {
        // Vérifier que le restaurant existe
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Récupérer toutes les critiques du restaurant
        const reviews = await Review.find({ restaurantId: restaurantId });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this restaurant' });
        }

        // Récupérer les informations des utilisateurs associés aux critiques
        const reviewsWithUserDetails = await Promise.all(
            reviews.map(async (review) => {
                const user = await User.findById(review.userId);
                return {
                    rating: review.rating,
                    comment: review.comment,
                    user: review.userId,
                    userName: user ? user.name : 'Unknown', // Inclure le nom de l'utilisateur
                    createdAt: review.createdAt,
                };
            })
        );

        // Renvoi des critiques avec les informations de l'utilisateur
        res.status(200).json({
            message: 'Reviews retrieved successfully',
            reviews: reviewsWithUserDetails,
        });
    } catch (error) {
        console.error('Erreur serveur :', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
