const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Dashboard route
router.get('/dashboard', employeeController.dashboard);

// Notifications routes
router.get('/notifications', employeeController.getNotifications);
router.post('/notifications/:notificationId/mark-read', employeeController.markNotificationAsRead);

module.exports = router;