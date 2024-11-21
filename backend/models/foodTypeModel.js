// backend/models/foodTypeModel.js

const db = require('../config/db');

exports.getAllFoodTypes = () => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM FoodTypes';
        db.query(sql, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.addFoodType = (foodType) => {
    return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO FoodTypes SET ?';
        db.query(sql, foodType, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};