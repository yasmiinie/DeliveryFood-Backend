const Notification = require('../models/Notifcation')

// Fetch all notifications
const getNotifications = async (req, res) => {
    const userId = req.query.userId; 
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    try {
        const notifications = await Notification.find({ userId })
        .sort({ date: -1 })
        .limit(20);
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
