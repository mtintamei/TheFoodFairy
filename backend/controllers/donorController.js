// backend/controllers/donorController.js

const db = require('../config/db');

exports.getAllDonors = (req, res) => {
    let sql = 'SELECT * FROM FoodDonors';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};

exports.addDonor = (req, res) => {
    let donor = req.body;
    let sql = 'INSERT INTO FoodDonors SET ?';
    db.query(sql, donor, (err, result) => {
        if (err) throw err;
        res.status(201).json({ message: 'New donor added' });
    });
};