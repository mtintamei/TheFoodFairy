const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiaryController');

// Define routes - Order matters!
// Put specific routes before parameterized routes
router.get('/active', beneficiaryController.getActiveBeneficiaries);
router.get('/routes', beneficiaryController.getAvailableRoutes);

// Then the general CRUD routes
router.get('/', beneficiaryController.getAllBeneficiaries);
router.post('/', beneficiaryController.createBeneficiary);
router.get('/:id', beneficiaryController.getBeneficiaryById);
router.put('/:id', beneficiaryController.updateBeneficiary);
router.delete('/:id', beneficiaryController.deleteBeneficiary);

module.exports = router;