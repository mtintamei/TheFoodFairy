const db = require('../config/db');

class Beneficiary {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM beneficiaries');
        return rows;
    }

    static async create(beneficiary) {
        const [result] = await db.query(
            'INSERT INTO beneficiaries (name, email, phone, address) VALUES (?, ?, ?, ?)',
            [beneficiary.name, beneficiary.email, beneficiary.phone, beneficiary.address]
        );
        return { id: result.insertId, ...beneficiary };
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM beneficiaries WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, beneficiary) {
        const [result] = await db.query(
            'UPDATE beneficiaries SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
            [beneficiary.name, beneficiary.email, beneficiary.phone, beneficiary.address, id]
        );
        return result.affectedRows > 0 ? { id, ...beneficiary } : null;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM beneficiaries WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Beneficiary;