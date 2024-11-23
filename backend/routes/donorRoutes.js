const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');

// Define routes
router.get('/', donorController.getAllDonors);
router.get('/:id', donorController.getDonorById);
router.post('/', donorController.createDonor);
router.put('/:id', donorController.updateDonor);
router.delete('/:id', donorController.deleteDonor);
router.get('/donations/pending', donorController.getPendingDonations);
router.post('/donations/:donation_id/assign', donorController.assignBeneficiary);

module.exports = router;