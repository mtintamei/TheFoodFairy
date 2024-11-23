const db = require('../config/db');

class VolunteerModel {
    static async create(volunteerData) {
        const [result] = await db.query(`
            INSERT INTO VOLUNTEERS 
            (first_name, last_name, email, gender, phone, start_date, address, why_volunteer)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            volunteerData.firstName,
            volunteerData.lastName,
            volunteerData.email,
            volunteerData.gender,
            volunteerData.phone,
            volunteerData.startDate,
            volunteerData.address,
            volunteerData.motivation
        ]);
        return result;
    }

    static async getActiveVolunteers() {
        const [volunteers] = await db.query(`
            SELECT * FROM VOLUNTEERS 
            WHERE status = 'active' 
            AND background_check = 'approved'
            ORDER BY first_name, last_name
        `);
        return volunteers;
    }

    static async getVolunteerById(id) {
        const [volunteers] = await db.query(
            'SELECT * FROM VOLUNTEERS WHERE volunteer_id = ?',
            [id]
        );
        return volunteers[0];
    }

    static async updateStatus(id, status) {
        const [result] = await db.query(
            'UPDATE VOLUNTEERS SET status = ? WHERE volunteer_id = ?',
            [status, id]
        );
        return result;
    }

    static async updateBackgroundCheck(id, status) {
        const [result] = await db.query(
            'UPDATE VOLUNTEERS SET background_check = ? WHERE volunteer_id = ?',
            [status, id]
        );
        return result;
    }
}

module.exports = VolunteerModel;