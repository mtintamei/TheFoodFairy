// backend/routes/foodTypeRoutes.js

const express = require('express');
const router = express.Router();
const foodTypeController = require('../controllers/foodTypeController');

router.get('/', foodTypeController.getAllFoodTypes);
router.post('/', foodTypeController.addFoodType);

module.exports = router;