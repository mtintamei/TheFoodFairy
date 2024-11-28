// backend/routes/volunteerRoutes.js

const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', volunteerController.addVolunteer);

// Protected routes - apply authMiddleware
router.use(authMiddleware);

// GET /api/volunteers/active
router.get('/active', volunteerController.getActiveVolunteers);

// Other routes
router.get('/', volunteerController.getAllVolunteers);
router.get('/available', volunteerController.getAvailableVolunteers);
router.put('/:id/status', volunteerController.updateStatus);
router.put('/:id/background-check', volunteerController.updateBackgroundCheck);
router.get('/:id', volunteerController.getVolunteerById);

module.exports = router;