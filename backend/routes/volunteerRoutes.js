// backend/routes/volunteerRoutes.js

const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route - no auth required
router.post('/register', volunteerController.addVolunteer);

// Protected routes - require authentication
router.get('/all', authMiddleware, volunteerController.getAllVolunteers);
router.get('/active', authMiddleware, volunteerController.getActiveVolunteers);
router.get('/available', authMiddleware, volunteerController.getAvailableVolunteers);
router.get('/:id', authMiddleware, volunteerController.getVolunteerById);
router.put('/:id/status', authMiddleware, volunteerController.updateVolunteerStatus);

module.exports = router;