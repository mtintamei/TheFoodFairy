const db = require('../config/db');

// Existing donor management functions
exports.getAllDonors = (req, res) => {
    let sql = 'SELECT * FROM DONORS';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};

exports.addDonor = (req, res) => {
    let donor = req.body;
    let sql = 'INSERT INTO DONORS SET ?';
    db.query(sql, donor, (err, result) => {
        if (err) throw err;
        res.status(201).json({ message: 'New donor added' });
    });
};

// New functions for pending donations
exports.getPendingDonations = (req, res) => {
    const sql = `
        SELECT 
            d.donation_id,
            d.quantity,
            d.pickup_time,
            f.name as food_name,
            f.category,
            f.unit,
            dn.name as donor_name
        FROM DONATIONS d
        JOIN FOOD_ITEMS f ON d.food_id = f.food_id
        JOIN DONORS dn ON d.donor_id = dn.donor_id
        WHERE d.status = 'pending'
        ORDER BY d.pickup_time ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching pending donations:', err);
            return res.status(500).json({ 
                message: 'Error fetching pending donations',
                error: err.message 
            });
        }
        res.json(results);
    });
};
exports.assignBeneficiary = (req, res) => {
    const { id } = req.params;
    const { recipient_id } = req.body;

    const sql = `
        UPDATE DONATIONS 
        SET recipient_id = ?, status = 'in_transit' 
        WHERE donation_id = ? AND status = 'pending'
    `;

    db.query(sql, [recipient_id, id], (err, result) => {
        if (err) {
            console.error('Error assigning beneficiary:', err);
            return res.status(500).json({ 
                message: 'Error assigning beneficiary',
                error: err.message 
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: 'Donation not found or already assigned' 
            });
        }

        // Create a notification for the assigned beneficiary
        const notificationSql = `
            INSERT INTO NOTIFICATIONS (user_id, message, reference_type, reference_id)
            VALUES (?, 'New donation has been assigned to you', 'donation', ?)
        `;

        db.query(notificationSql, [recipient_id, id], (notifErr) => {
            if (notifErr) {
                console.error('Error creating notification:', notifErr);
            }
        });

        res.json({ 
            message: 'Beneficiary assigned successfully',
            donation_id: id,
            recipient_id: recipient_id
        });
    });
};