const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    panierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Panier',
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    deliveryAddress: {
        street: String,
        city: String,
        postalCode: String,
        coordinates: {
            latitude: Number,
            longitude: Number,
        },
    },
    status: {
        type: String,
        enum: [
            'pending',             // Commande créée mais non confirmée par le restaurant
            'confirmed',           // Acceptée par le restaurant
            'in-preparation',      // Le restaurant prépare la commande
            'out-for-delivery',    // Le livreur a pris en charge la commande
            'delivered',           // La commande est arrivée
            'cancelled',           // La commande a été annulée
        ],
        default: 'pending',  // Valeur par défaut
    },
    placedAt: {
        type: Date,
        default: Date.now,
    },
    userNotes: {  // Notes personnalisées de l'utilisateur
        type: String,
        trim: true,  // Enlever les espaces inutiles au début et à la fin
    },
    deliveryNotes: {  // Notes de livraison pour aider le livreur
        type: String,
        trim: true,
    },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
