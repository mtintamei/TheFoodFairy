const db = require('../config/db');

const donorController = {
    // Get all donors
    getAllDonors: async (req, res) => {
        try {
            const [donors] = await db.query('SELECT * FROM DONORS');
            res.json(donors);
        } catch (error) {
            console.error('Error getting donors:', error);
            res.status(500).json({ message: 'Error getting donors' });
        }
    },

    // Get donor by ID
    getDonorById: async (req, res) => {
        try {
            const [donor] = await db.query('SELECT * FROM DONORS WHERE donor_id = ?', [req.params.id]);
            if (!donor[0]) {
                return res.status(404).json({ message: 'Donor not found' });
            }
            res.json(donor[0]);
        } catch (error) {
            console.error('Error getting donor:', error);
            res.status(500).json({ message: 'Error getting donor' });
        }
    },

    // Create new donor
    createDonor: async (req, res) => {
        try {
            const { name, type, contact_person, phone, email, address } = req.body;
            const [result] = await db.query(
                'INSERT INTO DONORS (name, type, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)',
                [name, type, contact_person, phone, email, address]
            );
            res.status(201).json({ 
                donor_id: result.insertId,
                name,
                type,
                contact_person,
                phone,
                email,
                address
            });
        } catch (error) {
            console.error('Error creating donor:', error);
            res.status(500).json({ message: 'Error creating donor' });
        }
    },

    // Update donor
    updateDonor: async (req, res) => {
        try {
            const { name, type, contact_person, phone, email, address } = req.body;
            const [result] = await db.query(
                'UPDATE DONORS SET name = ?, type = ?, contact_person = ?, phone = ?, email = ?, address = ? WHERE donor_id = ?',
                [name, type, contact_person, phone, email, address, req.params.id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Donor not found' });
            }
            res.json({ message: 'Donor updated successfully' });
        } catch (error) {
            console.error('Error updating donor:', error);
            res.status(500).json({ message: 'Error updating donor' });
        }
    },

    // Delete donor
    deleteDonor: async (req, res) => {
        try {
            const [result] = await db.query('DELETE FROM DONORS WHERE donor_id = ?', [req.params.id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Donor not found' });
            }
            res.json({ message: 'Donor deleted successfully' });
        } catch (error) {
            console.error('Error deleting donor:', error);
            res.status(500).json({ message: 'Error deleting donor' });
        }
    },

    // Add this new method
    getPendingDonations: async (req, res) => {
        try {
            const [donations] = await db.query(`
                SELECT 
                    d.donation_id,
                    d.quantity,
                    d.pickup_time,
                    d.status,
                    d.notes,
                    f.name as food_name,
                    f.category,
                    f.unit,
                    don.name as donor_name,
                    don.contact_person,
                    don.phone,
                    COALESCE(
                        (SELECT SUM(assigned_quantity) 
                        FROM DONATION_ASSIGNMENTS 
                        WHERE donation_id = d.donation_id),
                        0
                    ) as assigned_quantity,
                    d.quantity - COALESCE(
                        (SELECT SUM(assigned_quantity) 
                        FROM DONATION_ASSIGNMENTS 
                        WHERE donation_id = d.donation_id),
                        0
                    ) as remaining_quantity
                FROM DONATIONS d
                JOIN FOOD_ITEMS f ON d.food_id = f.food_id
                JOIN DONORS don ON d.donor_id = don.donor_id
                WHERE d.status != 'completed'
                HAVING remaining_quantity > 0
                ORDER BY d.pickup_time ASC
            `);
            
            res.json(donations);
        } catch (error) {
            console.error('Error fetching pending donations:', error);
            res.status(500).json({ 
                message: 'Error fetching pending donations',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    assignBeneficiary: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { donation_id } = req.params;
            const { recipient_id, route_id, scheduled_delivery_date, assigned_quantity } = req.body;

            // Check if donation exists and get current assignments
            const [donationResult] = await connection.query(`
                SELECT 
                    d.*,
                    COALESCE(SUM(da.assigned_quantity), 0) as total_assigned
                FROM DONATIONS d
                LEFT JOIN DONATION_ASSIGNMENTS da ON d.donation_id = da.donation_id
                WHERE d.donation_id = ?
                GROUP BY d.donation_id
            `, [donation_id]);

            const donation = donationResult[0];
            if (!donation) {
                await connection.rollback();
                return res.status(404).json({ message: 'Donation not found' });
            }

            const remainingQuantity = donation.quantity - donation.total_assigned;
            if (remainingQuantity < assigned_quantity) {
                await connection.rollback();
                return res.status(400).json({ 
                    message: 'Insufficient remaining quantity',
                    available: remainingQuantity
                });
            }

            // Create donation assignment
            const [result] = await connection.query(`
                INSERT INTO DONATION_ASSIGNMENTS 
                (donation_id, recipient_id, route_id, scheduled_delivery_date, assigned_quantity, status)
                VALUES (?, ?, ?, ?, ?, 'scheduled')
            `, [donation_id, recipient_id, route_id, scheduled_delivery_date, assigned_quantity]);

            // Check if donation is fully assigned
            const newRemainingQuantity = remainingQuantity - assigned_quantity;
            if (newRemainingQuantity === 0) {
                await connection.query(
                    'UPDATE DONATIONS SET status = "assigned" WHERE donation_id = ?',
                    [donation_id]
                );
            }

            await connection.commit();
            res.status(201).json({
                message: 'Donation assigned successfully',
                assignment_id: result.insertId,
                remaining_quantity: newRemainingQuantity
            });

        } catch (error) {
            await connection.rollback();
            console.error('Error assigning donation:', error);
            res.status(500).json({ 
                message: 'Error assigning donation',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } finally {
            connection.release();
        }
    }
};

module.exports = donorController;