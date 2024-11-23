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
    }
};

module.exports = beneficiaryController;