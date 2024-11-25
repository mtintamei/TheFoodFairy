// backend/routes/deliveryRoutes.js

const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/authMiddleware');

// Define routes
router.get('/today', authMiddleware, deliveryController.getTodayDeliveries);
router.get('/:assignment_id', authMiddleware, deliveryController.getDeliveryDetails);
router.post('/:assignment_id/assign-volunteer', authMiddleware, deliveryController.assignVolunteer);
router.put('/:assignment_id/reschedule', authMiddleware, deliveryController.rescheduleDelivery);
router.put('/:assignment_id/status', authMiddleware, deliveryController.updateDeliveryStatus);

module.exports = router;