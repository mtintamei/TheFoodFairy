// backend/models/deliveryModel.js

const db = require('../config/db');

class DeliveryModel {
    static async getAllDeliveries() {
        const [deliveries] = await db.query(`
            SELECT 
                d.*,
                v.first_name, v.last_name,
                da.scheduled_delivery_date,
                r.name as recipient_name,
                don.name as donor_name
            FROM DELIVERIES d
            JOIN VOLUNTEERS v ON d.volunteer_id = v.volunteer_id
            JOIN DONATION_ASSIGNMENTS da ON d.assignment_id = da.assignment_id
            JOIN RECIPIENTS r ON da.recipient_id = r.recipient_id
            JOIN DONATIONS dn ON da.donation_id = dn.donation_id
            JOIN DONORS don ON dn.donor_id = don.donor_id
            ORDER BY d.start_time DESC
        `);
        return deliveries;
    }

    static async addDelivery(delivery) {
        const [result] = await db.query(
            'INSERT INTO DELIVERIES SET ?',
            [delivery]
        );
        return result;
    }

    static async updateDeliveryStatus(id, status) {
        const [result] = await db.query(
            'UPDATE DELIVERIES SET status = ? WHERE delivery_id = ?',
            [status, id]
        );
        return result;
    }

    static async getDeliveryById(id) {
        const [deliveries] = await db.query(
            'SELECT * FROM DELIVERIES WHERE delivery_id = ?',
            [id]
        );
        return deliveries[0];
    }
}

module.exports = DeliveryModel;