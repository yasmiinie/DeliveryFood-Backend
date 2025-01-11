const Notification = require('../models/Notifcation')

// Fetch all notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ date: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notifications', error: err.message });
    }
};

// Add a new notification
const createNotification = async (req, res) => {
    const { text, orderId , userId } = req.body;
    try {
        const newNotification = new Notification({ text, orderId,userId });
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (err) {
        res.status(500).json({ message: 'Error creating notification', error: err.message });
    }
};

module.exports = { getNotifications, createNotification };
