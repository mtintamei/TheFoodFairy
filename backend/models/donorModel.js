// backend/models/donorModel.js

const db = require('../config/db');

exports.getAllDonors = () => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM FoodDonors';
        db.query(sql, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.addDonor = (donor) => {
    return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO FoodDonors SET ?';
        db.query(sql, donor, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};