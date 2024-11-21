// backend/routes/distributionRoutes.js

const express = require('express');
const router = express.Router();
const distributionController = require('../controllers/distributionController');

router.get('/', distributionController.getAllCenters);
router.post('/', distributionController.addCenter);

module.exports = router;