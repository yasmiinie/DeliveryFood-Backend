const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Panier = require('../models/Panier');
const User = require('../models/User');
const mongoose = require('mongoose');

// Créer une commande
router.post('/create', async (req, res) => {
    try {
        // Étape 1: Récupération des données envoyées
        const { userId, panierId, deliveryAddress, userNotes, deliveryNotes } = req.body;
        console.log("Données de la requête reçues :", req.body);

        // Étape 2: Vérification que les données sont valides
        if (!userId || !panierId || !deliveryAddress) {
            console.log("Données manquantes ou invalides. Vérifiez si tous les champs nécessaires sont envoyés.");
            return res.status(400).json({ message: "Données manquantes." });
        }

        // Vérification que userId et panierId sont des ObjectId valides
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(panierId)) {
            return res.status(400).json({ message: "ID utilisateur ou ID panier invalide." });
        }

        // Étape 3: Vérification du panier
        console.log(`Recherche du panier avec l'ID : ${panierId}`);
        const panier = await Panier.findById(panierId);
        if (!panier) {
            console.log('Panier introuvable avec l\'ID :', panierId);
            return res.status(400).json({ message: "Panier introuvable." });
        }
        console.log('Panier trouvé :', panier);

        // Vérification que l'ID utilisateur correspond à celui du panier
        if (panier.userId.toString() !== userId) {
            console.log('L\'ID utilisateur ne correspond pas à celui du panier.');
            return res.status(400).json({ message: "ID utilisateur incorrect." });
        }

        // Calcul du montant total à partir des articles du panier
        if (!panier.itemQuantities || panier.itemQuantities.length === 0) {
            console.log("Le panier est vide.");
            return res.status(400).json({ message: "Panier vide, impossible de calculer le montant." });
        }

        const totalAmount = panier.total + panier.deliveryFee;
        console.log('Montant total calculé :', totalAmount);

        // Étape 4: Création de la commande
        console.log("Création de la commande...");
        const order = new Order({
            userId,
            panierId,
            totalAmount,
            deliveryAddress,
            userNotes: userNotes ? userNotes.trim() : '',
            deliveryNotes: deliveryNotes ? deliveryNotes.trim() : '',
        });
        console.log("Commande créée avec les données suivantes :", order);

        // Étape 5: Sauvegarde de la commande
        console.log("Sauvegarde de la commande...");
        await order.save();
        console.log("Commande sauvegardée avec succès.");

        // Étape 6: Réinitialisation du panier après commande
        console.log("Mise à jour du statut du panier...");
        panier.status = 'closed';  // Mettre à jour le statut du panier
        await panier.save();
        console.log("Panier mis à jour avec succès.");

        // Réponse avec la commande créée
        res.status(201).json(order);
    } catch (err) {
        console.error('Erreur lors de la création de la commande:', err);
        res.status(500).json({ message: "Erreur lors de la création de la commande." });
    }
});

// Récupérer les commandes d'un utilisateur
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    // Vérification que l'ID utilisateur est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    try {
        // Rechercher les commandes pour un utilisateur spécifique
        const orders = await Order.find({ userId });

        // Vérifier si des commandes ont été trouvées
        if (orders.length === 0) {
            return res.status(404).json({ message: "Aucune commande trouvée." });
        }

        res.status(200).json(orders);
    } catch (err) {
        console.error('Erreur lors de la récupération des commandes:', err);
        res.status(500).json({ message: "Erreur lors de la récupération des commandes." });
    }
});

// Mettre à jour le statut d'une commande
router.put('/:orderId/status', async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in-preparation', 'out-for-delivery', 'delivered', 'cancelled'];

    // Vérification que l'ID de la commande est valide
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
        return res.status(400).json({ message: "ID de commande invalide." });
    }

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Statut invalide." });
    }

    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: "Commande non trouvée." });
        }

        order.status = status;
        await order.save();

        res.status(200).json(order);
    } catch (err) {
        console.error('Erreur lors de la mise à jour du statut:', err);
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut." });
    }
});

// Ajouter des notes à la commande (pour les préférences ou notes de livraison)
router.put('/:orderId/notes', async (req, res) => {
    const { userNotes, deliveryNotes } = req.body;

    // Vérification que l'ID de la commande est valide
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
        return res.status(400).json({ message: "ID de commande invalide." });
    }

    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: "Commande non trouvée." });
        }

        // Mise à jour des notes
        if (userNotes) order.userNotes = userNotes.trim();
        if (deliveryNotes) order.deliveryNotes = deliveryNotes.trim();

        await order.save();
        res.status(200).json(order);
    } catch (err) {
        console.error('Erreur lors de l\'ajout des notes:', err);
        res.status(500).json({ message: "Erreur lors de l'ajout des notes." });
    }
});

// Récupérer la liste des items dans un panier
router.get('/:panierId/items', async (req, res) => {
    const { panierId } = req.params;

    // Vérification que l'ID du panier est valide
    if (!mongoose.Types.ObjectId.isValid(panierId)) {
        return res.status(400).json({ message: "ID de panier invalide." });
    }

    try {
        // Rechercher le panier par son ID
        const panier = await Panier.findById(panierId).populate('itemQuantities.menuItemId');

        if (!panier) {
            return res.status(404).json({ message: "Panier non trouvé." });
        }

        // Récupérer les items et leurs quantités
        const items = panier.itemQuantities.map(item => ({
            menuItemId: item.menuItemId._id,
            menuItemName: item.menuItemId.name || 'Nom non défini',
            quantity: item.quantity,
        }));

        res.status(200).json(items);
    } catch (err) {
        console.error('Erreur lors de la récupération des items du panier:', err);
        res.status(500).json({ message: "Erreur lors de la récupération des items du panier." });
    }
});

module.exports = router;
