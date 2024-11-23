const db = require('../config/db');

class Donor {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM donors');
        return rows;
    }

    static async create(donor) {
        const [result] = await db.query(
            'INSERT INTO donors (name, email, phone, address) VALUES (?, ?, ?, ?)',
            [donor.name, donor.email, donor.phone, donor.address]
        );
        return { id: result.insertId, ...donor };
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM donors WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, donor) {
        const [result] = await db.query(
            'UPDATE donors SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
            [donor.name, donor.email, donor.phone, donor.address, id]
        );
        return result.affectedRows > 0 ? { id, ...donor } : null;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM donors WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Donor;