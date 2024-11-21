// backend/routes/beneficiaryRoutes.js

const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiaryController');

router.get('/', beneficiaryController.getAllBeneficiaries);
router.post('/', beneficiaryController.addBeneficiary);

module.exports = router;