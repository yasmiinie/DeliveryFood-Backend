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
    itemQuantities: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
            quantity: { type: Number, required: true, min: 1 },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    deliveryAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        coordinates: {
            latitude: { type: Number, required: false },
            longitude: { type: Number, required: false },
        },
    },
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'in-preparation',
            'out-for-delivery',
            'delivered',
            'cancelled',
        ],
        default: 'pending',
    },
    placedAt: {
        type: Date,
        default: Date.now,
    },
    userNotes: {
        type: String,
        trim: true,
    },
    deliveryNotes: {
        type: String,
        trim: true,
    },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
