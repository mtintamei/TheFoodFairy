const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/login', authController.login);

// Protected routes (require authentication)
router.use(authMiddleware);
router.get('/dashboard', employeeController.dashboard);
router.get('/notifications', employeeController.getNotifications);
router.post('/notifications/:notificationId/mark-read', employeeController.markNotificationAsRead);

module.exports = router;