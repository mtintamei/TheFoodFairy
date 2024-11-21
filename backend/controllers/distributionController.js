// backend/controllers/distributionController.js

const db = require('../config/db');

exports.getAllCenters = (req, res) => {
    let sql = 'SELECT * FROM DistributionCenters';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};

exports.addCenter = (req, res) => {
    let center = req.body;
    let sql = 'INSERT INTO DistributionCenters SET ?';
    db.query(sql, center, (err, result) => {
        if (err) throw err;
        res.status(201).json({ message: 'New distribution center added' });
    });
};