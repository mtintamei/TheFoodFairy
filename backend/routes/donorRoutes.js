const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');

// Define routes - specific routes first
router.get('/donations/pending', donorController.getPendingDonations);
router.get('/donations/:donation_id', donorController.getDonationDetails);
router.post('/donations/record', donorController.recordDonation);
router.post('/donations/:donation_id/assign', donorController.assignBeneficiary);

// Generic routes after
router.get('/', donorController.getAllDonors);
router.get('/:id', donorController.getDonorById);
router.post('/', donorController.createDonor);
router.put('/:id', donorController.updateDonor);
router.delete('/:id', donorController.deleteDonor);

module.exports = router;