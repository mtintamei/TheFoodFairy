// backend/controllers/foodTypeController.js

const db = require('../config/db');

exports.getAllFoodTypes = (req, res) => {
    let sql = 'SELECT * FROM FoodTypes';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};

exports.addFoodType = (req, res) => {
    let foodType = req.body;
    let sql = 'INSERT INTO FoodTypes SET ?';
    db.query(sql, foodType, (err, result) => {
        if (err) throw err;
        res.status(201).json({ message: 'New food type added' });
    });
};