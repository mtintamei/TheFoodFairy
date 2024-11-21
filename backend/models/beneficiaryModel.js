// backend/models/beneficiaryModel.js

const db = require('../config/db');

exports.getAllBeneficiaries = () => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM Beneficiaries';
        db.query(sql, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.addBeneficiary = (beneficiary) => {
    return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO Beneficiaries SET ?';
        db.query(sql, beneficiary, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};