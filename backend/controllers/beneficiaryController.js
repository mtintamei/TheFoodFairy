// backend/controllers/beneficiaryController.js

const db = require('../config/db');

exports.getAllBeneficiaries = (req, res) => {
    let sql = 'SELECT * FROM Beneficiaries';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json(results);
    });
};

exports.addBeneficiary = (req, res) => {
    let beneficiary = req.body;
    let sql = 'INSERT INTO Beneficiaries SET ?';
    db.query(sql, beneficiary, (err, result) => {
        if (err) {
            console.error('Error inserting beneficiary:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({ message: 'New beneficiary added' });
    });
};