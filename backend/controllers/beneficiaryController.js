const db = require('../config/db');

exports.getAllBeneficiaries = (req, res) => {
    let sql = 'SELECT * FROM RECIPIENTS WHERE status = "active"';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json(results);
    });
};

exports.getActiveBeneficiaries = (req, res) => {
    const sql = `
        SELECT 
            recipient_id,
            name,
            capacity,
            type
        FROM RECIPIENTS 
        WHERE status = 'active'
        ORDER BY name ASC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching active beneficiaries:', err);
            return res.status(500).json({ 
                message: 'Error fetching beneficiaries',
                error: err.message 
            });
        }
        res.json(results);
    });
};

exports.addBeneficiary = (req, res) => {
    let beneficiary = req.body;
    let sql = 'INSERT INTO RECIPIENTS SET ?';
    db.query(sql, beneficiary, (err, result) => {
        if (err) {
            console.error('Error inserting beneficiary:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({ message: 'New beneficiary added' });
    });
};