// backend/controllers/deliveryController.js

const db = require('../config/db');

exports.getAllDeliveries = (req, res) => {
    let sql = 'SELECT * FROM DeliveryRecords';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};

exports.addDelivery = (req, res) => {
    let delivery = req.body;
    let sql = 'INSERT INTO DeliveryRecords SET ?';
    db.query(sql, delivery, (err, result) => {
        if (err) throw err;
        res.status(201).json({ message: 'New delivery record added' });
    });
};