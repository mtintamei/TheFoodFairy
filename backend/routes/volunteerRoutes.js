// backend/routes/volunteerRoutes.js

const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', volunteerController.addVolunteer);

// Protected routes
router.use(authMiddleware);

// Admin only routes
router.get('/', volunteerController.getAllVolunteers);
router.get('/active', volunteerController.getActiveVolunteers);
router.get('/available', authMiddleware, volunteerController.getAvailableVolunteers);
router.put('/:id/status', volunteerController.updateStatus);
router.put('/:id/background-check', volunteerController.updateBackgroundCheck);
router.get('/:id', volunteerController.getVolunteerById);

module.exports = router;