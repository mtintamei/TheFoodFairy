// backend/controllers/deliveryController.js

const db = require('../config/db');

// Export individual functions directly
exports.getTodayDeliveries = async (req, res) => {
    try {
        const [deliveries] = await db.query(`
            SELECT 
                d.delivery_id,
                d.status as delivery_status,
                da.status as assignment_status,
                COALESCE(d.status, da.status) as effective_status,
                d.start_time,
                d.end_time,
                d.condition_on_delivery,
                d.notes,
                da.assignment_id,
                da.scheduled_delivery_date,
                da.assigned_quantity,
                r.name as recipient_name,
                r.address as recipient_address,
                r.contact_person,
                r.phone,
                rt.name as route_name,
                rt.distance_km,
                rt.estimated_duration_mins,
                f.name as food_name,
                f.category,
                f.unit,
                f.storage_type,
                CONCAT(v.first_name, ' ', v.last_name) as volunteer_name,
                v.phone as volunteer_phone,
                v.volunteer_id
            FROM DONATION_ASSIGNMENTS da
            JOIN RECIPIENTS r ON da.recipient_id = r.recipient_id
            JOIN ROUTES rt ON da.route_id = rt.route_id
            JOIN DONATIONS don ON da.donation_id = don.donation_id
            JOIN FOOD_ITEMS f ON don.food_id = f.food_id
            LEFT JOIN DELIVERIES d ON da.assignment_id = d.assignment_id
            LEFT JOIN VOLUNTEERS v ON d.volunteer_id = v.volunteer_id
            WHERE DATE(da.scheduled_delivery_date) = CURDATE()
            ORDER BY 
                CASE COALESCE(d.status, da.status)
                    WHEN 'failed' THEN 1
                    WHEN 'delayed' THEN 2
                    WHEN 'in_progress' THEN 3
                    WHEN 'scheduled' THEN 4
                    WHEN 'completed' THEN 5
                    ELSE 6
                END,
                da.scheduled_delivery_date ASC
        `);
        
        res.json(deliveries);
    } catch (error) {
        console.error('Error fetching today\'s deliveries:', error);
        res.status(500).json({ 
            message: 'Error fetching deliveries',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.assignVolunteer = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { assignment_id } = req.params;
        const { volunteer_id } = req.body;

        // Check if assignment exists
        const [assignments] = await connection.query(
            'SELECT * FROM DONATION_ASSIGNMENTS WHERE assignment_id = ?',
            [assignment_id]
        );

        if (assignments.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if delivery exists
        const [existingDelivery] = await connection.query(
            'SELECT * FROM DELIVERIES WHERE assignment_id = ?',
            [assignment_id]
        );

        let result;
        if (existingDelivery.length > 0) {
            // Update existing delivery with new volunteer
            [result] = await connection.query(
                'UPDATE DELIVERIES SET volunteer_id = ?, status = "scheduled" WHERE assignment_id = ?',
                [volunteer_id, assignment_id]
            );
        } else {
            // Create new delivery record
            [result] = await connection.query(
                'INSERT INTO DELIVERIES (assignment_id, volunteer_id, status) VALUES (?, ?, "scheduled")',
                [assignment_id, volunteer_id]
            );
        }

        // Update assignment status to scheduled
        await connection.query(
            'UPDATE DONATION_ASSIGNMENTS SET status = "scheduled" WHERE assignment_id = ?',
            [assignment_id]
        );

        await connection.commit();
        res.status(200).json({
            message: 'Volunteer assigned successfully',
            delivery_id: existingDelivery.length > 0 ? existingDelivery[0].delivery_id : result.insertId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error assigning volunteer:', error);
        res.status(500).json({ 
            message: 'Error assigning volunteer',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        connection.release();
    }
};

exports.rescheduleDelivery = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { assignment_id } = req.params;
        const { scheduled_delivery_date } = req.body;

        // Validate the assignment exists
        const [assignment] = await connection.query(
            'SELECT * FROM DONATION_ASSIGNMENTS WHERE assignment_id = ?',
            [assignment_id]
        );

        if (assignment.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Delivery assignment not found' });
        }

        // Update the delivery date
        await connection.query(
            'UPDATE DONATION_ASSIGNMENTS SET scheduled_delivery_date = ?, status = "scheduled" WHERE assignment_id = ?',
            [scheduled_delivery_date, assignment_id]
        );

        // Update the delivery status if it exists
        await connection.query(
            'UPDATE DELIVERIES SET status = "scheduled" WHERE assignment_id = ?',
            [assignment_id]
        );

        await connection.commit();
        res.json({ 
            message: 'Delivery rescheduled successfully',
            scheduled_delivery_date: scheduled_delivery_date
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error rescheduling delivery:', error);
        res.status(500).json({ 
            message: 'Error rescheduling delivery',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        connection.release();
    }
};

exports.updateDeliveryStatus = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { assignment_id } = req.params;
        const { status, notes } = req.body;

        // Validate status
        const validStatuses = ['scheduled', 'in_progress', 'completed', 'delayed', 'failed'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }

        const timestamp = new Date().toISOString();
        const statusNote = `${timestamp}: Status changed to ${status}${notes ? ' - ' + notes : ''}`;

        // Update both tables within the transaction
        await connection.query(
            'UPDATE DELIVERIES SET status = ?, notes = ?, updated_at = NOW() WHERE assignment_id = ?',
            [status, statusNote, assignment_id]
        );

        await connection.query(
            'UPDATE DONATION_ASSIGNMENTS SET status = ?, updated_at = NOW() WHERE assignment_id = ?',
            [status, assignment_id]
        );

        await connection.commit();
        
        res.json({ 
            success: true,
            message: 'Delivery status updated successfully',
            status: status,
            assignment_id: assignment_id
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error in updateDeliveryStatus:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error updating delivery status'
        });
    } finally {
        connection.release();
    }
};

exports.getDeliveryDetails = async (req, res) => {
    try {
        const { assignment_id } = req.params;
        const [deliveries] = await db.query(`
            SELECT 
                da.assignment_id,
                da.scheduled_delivery_date,
                da.assigned_quantity,
                da.status as assignment_status,
                r.name as recipient_name,
                r.address as recipient_address,
                r.contact_person,
                r.phone,
                f.name as food_name,
                f.category,
                f.unit,
                f.storage_type,
                d.delivery_id,
                d.status as delivery_status,
                d.start_time,
                d.end_time,
                d.condition_on_delivery,
                d.notes,
                CONCAT(v.first_name, ' ', v.last_name) as volunteer_name,
                v.phone as volunteer_phone
            FROM DONATION_ASSIGNMENTS da
            JOIN RECIPIENTS r ON da.recipient_id = r.recipient_id
            JOIN DONATIONS don ON da.donation_id = don.donation_id
            JOIN FOOD_ITEMS f ON don.food_id = f.food_id
            LEFT JOIN DELIVERIES d ON da.assignment_id = d.assignment_id
            LEFT JOIN VOLUNTEERS v ON d.volunteer_id = v.volunteer_id
            WHERE da.assignment_id = ?
        `, [assignment_id]);
        
        if (!deliveries || deliveries.length === 0) {
            return res.status(404).json({ message: 'Delivery not found' });
        }
        
        res.json(deliveries[0]); // Send single object instead of array
    } catch (error) {
        console.error('Error fetching delivery details:', error);
        res.status(500).json({ 
            message: 'Error fetching delivery details',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};