const mongoose = require('mongoose');

const panierSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
      }
    ],
    total: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,  // Frais de livraison par défaut
    },
    itemQuantities: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    status: {
      type: String,
      default: 'open',  // Statut du panier
    },
});

const Panier = mongoose.model('Panier', panierSchema);

module.exports = Panier;
