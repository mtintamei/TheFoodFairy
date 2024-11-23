const FoodType = require('../models/foodTypeModel');

const foodTypeController = {
    // Get all food types
    getAllFoodTypes: async (req, res) => {
        try {
            const foodTypes = await FoodType.findAll();
            res.json(foodTypes);
        } catch (error) {
            console.error('Error getting food types:', error);
            res.status(500).json({ message: 'Error getting food types' });
        }
    },

    // Create new food type
    createFoodType: async (req, res) => {
        try {
            const newFoodType = await FoodType.create(req.body);
            res.status(201).json(newFoodType);
        } catch (error) {
            console.error('Error creating food type:', error);
            res.status(500).json({ message: 'Error creating food type' });
        }
    },

    // Get food type by ID
    getFoodTypeById: async (req, res) => {
        try {
            const foodType = await FoodType.findById(req.params.id);
            if (!foodType) {
                return res.status(404).json({ message: 'Food type not found' });
            }
            res.json(foodType);
        } catch (error) {
            console.error('Error getting food type:', error);
            res.status(500).json({ message: 'Error getting food type' });
        }
    },

    // Update food type
    updateFoodType: async (req, res) => {
        try {
            const updated = await FoodType.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ message: 'Food type not found' });
            }
            res.json(updated);
        } catch (error) {
            console.error('Error updating food type:', error);
            res.status(500).json({ message: 'Error updating food type' });
        }
    },

    // Delete food type
    deleteFoodType: async (req, res) => {
        try {
            const deleted = await FoodType.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ message: 'Food type not found' });
            }
            res.json({ message: 'Food type deleted successfully' });
        } catch (error) {
            console.error('Error deleting food type:', error);
            res.status(500).json({ message: 'Error deleting food type' });
        }
    }
};

module.exports = foodTypeController;