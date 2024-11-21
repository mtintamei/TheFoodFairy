const db = require('../config/db');

exports.getAllFoodTypes = (req, res) => {
    let sql = 'SELECT * FROM FOOD_ITEMS';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching food types:', err);
            return res.status(500).json({ 
                message: 'Error fetching food types',
                error: err.message 
            });
        }
        res.json(results);
    });
};

exports.addFoodType = (req, res) => {
    let foodType = req.body;
    let sql = 'INSERT INTO FOOD_ITEMS SET ?';
    db.query(sql, foodType, (err, result) => {
        if (err) {
            console.error('Error adding food type:', err);
            return res.status(500).json({ 
                message: 'Error adding food type',
                error: err.message 
            });
        }
        res.status(201).json({ message: 'New food type added' });
    });
};