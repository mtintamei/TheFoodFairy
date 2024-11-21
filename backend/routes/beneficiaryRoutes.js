const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiaryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', beneficiaryController.getAllBeneficiaries);
router.get('/active', authMiddleware, beneficiaryController.getActiveBeneficiaries);
router.post('/', beneficiaryController.addBeneficiary);

module.exports = router;