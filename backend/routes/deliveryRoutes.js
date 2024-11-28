// backend/routes/deliveryRoutes.js

const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/authMiddleware');

// Define routes - specific routes first, before any parameterized routes
router.get('/routes', authMiddleware, deliveryController.getRoutes);  // Added authMiddleware
router.get('/today', authMiddleware, deliveryController.getTodayDeliveries);
router.post('/schedule', authMiddleware, deliveryController.scheduleDelivery);

// Parameterized routes last
router.get('/:assignment_id', authMiddleware, deliveryController.getDeliveryDetails);
router.post('/:assignment_id/assign-volunteer', authMiddleware, deliveryController.assignVolunteer);
router.put('/:assignment_id/reschedule', authMiddleware, deliveryController.rescheduleDelivery);
router.put('/:assignment_id/status', authMiddleware, deliveryController.updateDeliveryStatus);

// Add this new calendar route
router.get('/calendar/:year/:month', authMiddleware, deliveryController.getCalendarDeliveries);

module.exports = router;