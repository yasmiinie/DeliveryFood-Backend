const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }, // Defaults to current date
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, // Link to the related order
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification ;