const db = require('../config/db');

exports.getAllBeneficiaries = () => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM RECIPIENTS';
        db.query(sql, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.addBeneficiary = (beneficiary) => {
    return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO RECIPIENTS SET ?';
        db.query(sql, beneficiary, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};