const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const authMiddleware = require('../middleware/authMiddleware');

// Existing routes
router.get('/', donorController.getAllDonors);
router.post('/', donorController.addDonor);

// New routes for pending donations
router.get('/donations/pending', authMiddleware, donorController.getPendingDonations);
router.post('/donations/:id/assign', authMiddleware, donorController.assignBeneficiary);

module.exports = router;