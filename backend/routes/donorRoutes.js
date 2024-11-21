// backend/routes/donorRoutes.js

const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');

router.get('/', donorController.getAllDonors);
router.post('/', donorController.addDonor);

module.exports = router;