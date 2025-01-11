const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }, // Defaults to current date
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, // Link to the related order
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', // Reference to the User model
        required: true // Ensure every notification is linked to a user
    },
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification ;