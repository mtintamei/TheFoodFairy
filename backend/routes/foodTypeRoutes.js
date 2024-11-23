// backend/routes/foodTypeRoutes.js

const express = require('express');
const router = express.Router();
const foodTypeController = require('../controllers/foodTypeController');

// Define routes
router.get('/', foodTypeController.getAllFoodTypes);
router.post('/', foodTypeController.createFoodType);
router.get('/:id', foodTypeController.getFoodTypeById);
router.put('/:id', foodTypeController.updateFoodType);
router.delete('/:id', foodTypeController.deleteFoodType);

module.exports = router;