// backend/models/distributionModel.js

const db = require('../config/db');

exports.getAllCenters = () => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM DistributionCenters';
        db.query(sql, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.addCenter = (center) => {
    return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO DistributionCenters SET ?';
        db.query(sql, center, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};