// backend/models/deliveryModel.js

const db = require('../config/db');

exports.getAllDeliveries = () => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM DeliveryRecords';
        db.query(sql, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.addDelivery = (delivery) => {
    return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO DeliveryRecords SET ?';
        db.query(sql, delivery, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};