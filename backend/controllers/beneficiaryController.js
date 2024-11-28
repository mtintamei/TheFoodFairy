const db = require('../config/db');

const beneficiaryController = {
    // Get all beneficiaries
    getAllBeneficiaries: async (req, res) => {
        try {
            const [beneficiaries] = await db.query('SELECT * FROM RECIPIENTS');
            res.json(beneficiaries);
        } catch (error) {
            console.error('Error getting beneficiaries:', error);
            res.status(500).json({ message: 'Error getting beneficiaries' });
        }
    },

    // Get beneficiary by ID
    getBeneficiaryById: async (req, res) => {
        try {
            const [beneficiary] = await db.query('SELECT * FROM RECIPIENTS WHERE recipient_id = ?', [req.params.id]);
            if (!beneficiary[0]) {
                return res.status(404).json({ message: 'Beneficiary not found' });
            }
            res.json(beneficiary[0]);
        } catch (error) {
            console.error('Error getting beneficiary:', error);
            res.status(500).json({ message: 'Error getting beneficiary' });
        }
    },

    // Create new beneficiary
    createBeneficiary: async (req, res) => {
        try {
            const { name, type, contact_person, phone, email, address, capacity } = req.body;
            const [result] = await db.query(
                'INSERT INTO RECIPIENTS (name, type, contact_person, phone, email, address, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [name, type, contact_person, phone, email, address, capacity]
            );
            res.status(201).json({ 
                recipient_id: result.insertId,
                name,
                type,
                contact_person,
                phone,
                email,
                address,
                capacity
            });
        } catch (error) {
            console.error('Error creating beneficiary:', error);
            res.status(500).json({ message: 'Error creating beneficiary' });
        }
    },

    // Update beneficiary
    updateBeneficiary: async (req, res) => {
        try {
            const { name, type, contact_person, phone, email, address, capacity } = req.body;
            const [result] = await db.query(
                'UPDATE RECIPIENTS SET name = ?, type = ?, contact_person = ?, phone = ?, email = ?, address = ?, capacity = ? WHERE recipient_id = ?',
                [name, type, contact_person, phone, email, address, capacity, req.params.id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Beneficiary not found' });
            }
            res.json({ message: 'Beneficiary updated successfully' });
        } catch (error) {
            console.error('Error updating beneficiary:', error);
            res.status(500).json({ message: 'Error updating beneficiary' });
        }
    },

    // Delete beneficiary
    deleteBeneficiary: async (req, res) => {
        try {
            const [result] = await db.query('DELETE FROM RECIPIENTS WHERE recipient_id = ?', [req.params.id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Beneficiary not found' });
            }
            res.json({ message: 'Beneficiary deleted successfully' });
        } catch (error) {
            console.error('Error deleting beneficiary:', error);
            res.status(500).json({ message: 'Error deleting beneficiary' });
        }
    },

    // Add this new method
    getActiveBeneficiaries: async (req, res) => {
        try {
            console.log('Fetching active beneficiaries...');
            const [beneficiaries] = await db.query(`
                SELECT 
                    recipient_id,
                    name,
                    type,
                    contact_person,
                    phone,
                    email,
                    address,
                    capacity
                FROM RECIPIENTS
                WHERE status = 'active'
                ORDER BY name ASC
            `);
            console.log('Found beneficiaries:', beneficiaries.length);
            res.json(beneficiaries);
        } catch (error) {
            console.error('Error fetching active beneficiaries:', error);
            res.status(500).json({ 
                message: 'Error fetching active beneficiaries',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Add this method to fetch available routes
    getAvailableRoutes: async (req, res) => {
        try {
            const [routes] = await db.query(`
                SELECT 
                    route_id,
                    name,
                    start_location,
                    end_location,
                    distance_km,
                    estimated_duration_mins
                FROM ROUTES
                WHERE status = 'active'
                ORDER BY name ASC
            `);
            res.json(routes);
        } catch (error) {
            console.error('Error fetching routes:', error);
            res.status(500).json({ 
                message: 'Error fetching routes',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Add new method for assigning beneficiary to donation
    assignToDonation: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const { donation_id } = req.params;
            const { recipient_id, assigned_quantity, route_id, scheduled_delivery_date, status } = req.body;

            console.log('Assignment request:', {
                donation_id,
                recipient_id,
                assigned_quantity,
                route_id,
                scheduled_delivery_date,
                status
            });

            // First, check if donation exists and get its details
            const [donationResult] = await connection.query(`
                SELECT d.*, 
                        COALESCE(SUM(da.assigned_quantity), 0) as total_assigned
                 FROM DONATIONS d
                 LEFT JOIN DONATION_ASSIGNMENTS da ON d.donation_id = da.donation_id
                 WHERE d.donation_id = ?
                 GROUP BY d.donation_id`,
                [donation_id]
            );

            if (!donationResult.length) {
                await connection.rollback();
                return res.status(404).json({ message: 'Donation not found' });
            }

            const donation = donationResult[0];
            const remainingQuantity = parseFloat(donation.quantity) - parseFloat(donation.total_assigned || 0);

            // Validate assigned quantity
            if (remainingQuantity < assigned_quantity) {
                await connection.rollback();
                return res.status(400).json({ 
                    message: 'Insufficient remaining quantity',
                    available: remainingQuantity
                });
            }

            // Create donation assignment with explicit status
            const [result] = await connection.query(`
                INSERT INTO DONATION_ASSIGNMENTS 
                (donation_id, recipient_id, assigned_quantity, route_id, scheduled_delivery_date, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [donation_id, recipient_id, assigned_quantity, route_id, scheduled_delivery_date, status || 'scheduled']
            );

            // Update donation status if fully assigned
            const newRemainingQuantity = remainingQuantity - assigned_quantity;
            if (newRemainingQuantity === 0) {
                await connection.query(
                    'UPDATE DONATIONS SET status = "assigned", updated_at = NOW() WHERE donation_id = ?',
                    [donation_id]
                );
            }

            await connection.commit();
            
            res.status(201).json({
                message: 'Beneficiary assigned successfully',
                assignment_id: result.insertId,
                remaining_quantity: newRemainingQuantity
            });

        } catch (error) {
            await connection.rollback();
            console.error('Error in assignToDonation:', error);
            console.error('Stack trace:', error.stack);
            res.status(500).json({ 
                message: 'Error assigning beneficiary',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } finally {
            connection.release();
        }
    }
};

module.exports = beneficiaryController;