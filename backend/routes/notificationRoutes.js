const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Routes for all authenticated users
router.get('/my-notifications', notificationController.getUserNotifications);
router.post('/:id/mark-read', notificationController.markAsRead);

// Admin only routes
router.post('/send', authorize('admin'), notificationController.sendNotification);
router.get('/all', authorize('admin'), notificationController.getAllNotifications);

module.exports = router; 