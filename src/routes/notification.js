const express = require('express');
const { getNotifications, createNotification } = require('../controllers/Notification');

const router = express.Router();

// Define the notification routes
router.get('/', getNotifications);
router.post('/', createNotification);

module.exports = router;
