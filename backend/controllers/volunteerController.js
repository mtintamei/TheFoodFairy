const db = require('../config/db');

exports.addVolunteer = async (req, res) => {
    try {
        const { firstname, lastname, email, gender, phone, start_date, address, why_volunteer } = req.body;

        if (!firstname || !lastname || !email || !gender || !phone || !start_date || !address || !why_volunteer) {
            return res.status(400).json({ message: 'Missing required fields', received: req.body });
        }

        // Check if volunteer exists
        const [existingVolunteers] = await db.query(
            'SELECT * FROM VOLUNTEERS WHERE email = ?',
            [email]
        );

        if (existingVolunteers.length > 0) {
            return res.status(409).json({ message: 'Volunteer with this email already exists' });
        }

        const volunteer = {
            first_name: firstname,
            last_name: lastname,
            email: email,
            gender: gender,
            phone: phone,
            start_date: start_date,
            address: address,
            why_volunteer: why_volunteer
        };

        const [result] = await db.query(
            'INSERT INTO VOLUNTEERS SET ?',
            [volunteer]
        );

        res.status(201).json({ 
            message: 'New volunteer added', 
            volunteerId: result.insertId 
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            message: 'Database error', 
            error: error.message 
        });
    }
};

exports.getAllVolunteers = async (req, res) => {
    try {
        const [volunteers] = await db.query(`
            SELECT * FROM VOLUNTEERS
            ORDER BY first_name, last_name
        `);
        res.json(volunteers);
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        res.status(500).json({ 
            message: 'Error fetching volunteers',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getActiveVolunteers = async (req, res) => {
    try {
        console.log('getActiveVolunteers endpoint hit');
        console.log('Request path:', req.path);
        console.log('Request URL:', req.originalUrl);
        
        console.log('Getting active volunteers...');
        console.log('User:', req.user);

        const [volunteers] = await db.query(`
            SELECT 
                v.volunteer_id,
                v.first_name,
                v.last_name,
                v.email,
                v.phone,
                v.address,
                v.start_date,
                v.background_check,
                v.status,
                v.why_volunteer
            FROM VOLUNTEERS v
            WHERE v.status = 'active'
            ORDER BY v.start_date DESC
        `);

        console.log('Query results:', volunteers);

        res.json(volunteers);
    } catch (error) {
        console.error('Error in getActiveVolunteers:', {
            message: error.message,
            stack: error.stack
        });
        
        res.status(500).json({ 
            message: 'Error fetching volunteers',
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
                phone 
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

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await db.query(
            'UPDATE VOLUNTEERS SET status = ? WHERE volunteer_id = ?',
            [status, id]
        );
        
        res.json({ message: 'Volunteer status updated successfully' });
    } catch (error) {
        console.error('Error updating volunteer status:', error);
        res.status(500).json({ 
            message: 'Error updating volunteer status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.updateBackgroundCheck = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        await db.query(
            'UPDATE VOLUNTEERS SET background_check_status = ?, background_check_notes = ? WHERE volunteer_id = ?',
            [status, notes, id]
        );
        
        res.json({ message: 'Background check status updated successfully' });
    } catch (error) {
        console.error('Error updating background check:', error);
        res.status(500).json({ 
            message: 'Error updating background check',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getVolunteerById = async (req, res) => {
    try {
        const { id } = req.params;
        const [volunteers] = await db.query(
            'SELECT * FROM VOLUNTEERS WHERE volunteer_id = ?',
            [id]
        );
        
        if (volunteers.length === 0) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        
        res.json(volunteers[0]);
    } catch (error) {
        console.error('Error fetching volunteer:', error);
        res.status(500).json({ 
            message: 'Error fetching volunteer',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};