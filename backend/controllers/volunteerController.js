const db = require('../config/db');

exports.addVolunteer = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, gender, startDate, address, motivation } = req.body;
        
        // Check if volunteer with this email already exists
        const [existingVolunteer] = await db.query(
            'SELECT volunteer_id FROM VOLUNTEERS WHERE email = ?',
            [email]
        );

        if (existingVolunteer.length > 0) {
            return res.status(400).json({ 
                message: 'Volunteer with this email already exists'
            });
        }

        const [result] = await db.query(`
            INSERT INTO VOLUNTEERS 
            (first_name, last_name, email, phone, gender, start_date, address, why_volunteer, status, background_check)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_verification', 'pending')
        `, [
            firstName,
            lastName,
            email,
            phone,
            gender,
            startDate,
            address,
            motivation
        ]);

        res.status(201).json({ 
            message: 'New volunteer added',
            volunteerId: result.insertId 
        });
    } catch (error) {
        console.error('Error adding volunteer:', error);
        res.status(500).json({ 
            message: 'Error adding volunteer',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getAllVolunteers = async (req, res) => {
    try {
        console.log('Fetching all volunteers...');
        const [volunteers] = await db.query(`
            SELECT 
                volunteer_id,
                first_name,
                last_name,
                email,
                phone,
                address,
                join_date,
                status,
                background_check,
                start_date,
                why_volunteer
            FROM VOLUNTEERS
            ORDER BY join_date DESC
        `);
        console.log('Found volunteers:', volunteers.length);
        res.json(volunteers);
    } catch (error) {
        console.error('Error fetching all volunteers:', error);
        res.status(500).json({ 
            message: 'Error fetching volunteers',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getVolunteerById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching volunteer details for ID:', id);

        // First, get the volunteer details
        const [volunteers] = await db.query(`
            SELECT 
                volunteer_id,
                first_name,
                last_name,
                email,
                phone,
                address,
                start_date,
                join_date,
                status,
                background_check,
                why_volunteer,
                gender
            FROM VOLUNTEERS
            WHERE volunteer_id = ?
        `, [id]);

        console.log('Volunteer query result:', volunteers);

        if (volunteers.length === 0) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        // Then, get delivery statistics
        const [deliveryStats] = await db.query(`
            SELECT 
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_deliveries,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as ongoing_deliveries
            FROM DELIVERIES 
            WHERE volunteer_id = ?
        `, [id]);

        console.log('Delivery stats:', deliveryStats);

        // Combine the data
        const volunteerData = {
            ...volunteers[0],
            stats: {
                completed_deliveries: deliveryStats[0].completed_deliveries || 0,
                ongoing_deliveries: deliveryStats[0].ongoing_deliveries || 0
            }
        };

        console.log('Sending volunteer data:', volunteerData);
        res.json(volunteerData);

    } catch (error) {
        console.error('Detailed error in getVolunteerById:', error);
        res.status(500).json({ 
            message: 'Error fetching volunteer details',
            error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
};

exports.updateVolunteerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log('Updating volunteer status:', { id, status });

        // Validate status
        const validStatuses = ['pending_verification', 'active', 'inactive'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // First, get current volunteer status
        const [currentVolunteer] = await db.query(
            'SELECT status, background_check FROM VOLUNTEERS WHERE volunteer_id = ?',
            [id]
        );

        if (!currentVolunteer.length) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        // If activating a volunteer
        if (status === 'active') {
            // Automatically approve background check when activating
            await db.query(
                'UPDATE VOLUNTEERS SET status = ?, background_check = ? WHERE volunteer_id = ?',
                [status, 'approved', id]
            );
        } else {
            // For other status changes, just update the status
            await db.query(
                'UPDATE VOLUNTEERS SET status = ? WHERE volunteer_id = ?',
                [status, id]
            );
        }

        // If deactivating a volunteer, cancel their pending deliveries
        if (status === 'inactive') {
            await db.query(`
                UPDATE DELIVERIES 
                SET status = 'cancelled', 
                    volunteer_id = NULL
                WHERE volunteer_id = ? 
                AND status IN ('scheduled', 'in_progress')
            `, [id]);
        }
        
        res.json({ 
            message: 'Volunteer status updated successfully',
            status: status
        });
    } catch (error) {
        console.error('Error updating volunteer status:', error);
        res.status(500).json({ 
            message: 'Error updating volunteer status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getActiveVolunteers = async (req, res) => {
    try {
        console.log('Fetching active volunteers...');
        const [volunteers] = await db.query(`
            SELECT 
                volunteer_id,
                first_name,
                last_name,
                email,
                phone,
                address,
                join_date,
                background_check,
                start_date,
                why_volunteer,
                status
            FROM VOLUNTEERS
            WHERE status = 'active'
            ORDER BY join_date DESC
        `);
        console.log('Found active volunteers:', volunteers.length);
        res.json(volunteers);
    } catch (error) {
        console.error('Error fetching active volunteers:', error);
        res.status(500).json({ 
            message: 'Error fetching active volunteers',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getAvailableVolunteers = async (req, res) => {
    try {
        const [volunteers] = await db.query(`
            SELECT 
                volunteer_id,
                first_name,
                last_name,
                phone,
                start_date
            FROM VOLUNTEERS 
            WHERE status = 'active' 
            AND background_check = 'approved'
            ORDER BY first_name, last_name
        `);
        res.json(volunteers);
    } catch (error) {
        console.error('Error fetching available volunteers:', error);
        res.status(500).json({ 
            message: 'Error fetching available volunteers',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};