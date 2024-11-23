const db = require('../config/db');

class FoodType {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM FOOD_ITEMS');
        return rows;
    }

    static async create(foodItem) {
        const [result] = await db.query(
            'INSERT INTO FOOD_ITEMS (name, category, unit, shelf_life_days, storage_type, allergens, perishable) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                foodItem.name,
                foodItem.category,
                foodItem.unit,
                foodItem.shelf_life_days,
                foodItem.storage_type,
                foodItem.allergens,
                foodItem.perishable
            ]
        );
        return { id: result.insertId, ...foodItem };
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM FOOD_ITEMS WHERE food_id = ?', [id]);
        return rows[0];
    }

    static async update(id, foodItem) {
        const [result] = await db.query(
            'UPDATE FOOD_ITEMS SET name = ?, category = ?, unit = ?, shelf_life_days = ?, storage_type = ?, allergens = ?, perishable = ? WHERE food_id = ?',
            [
                foodItem.name,
                foodItem.category,
                foodItem.unit,
                foodItem.shelf_life_days,
                foodItem.storage_type,
                foodItem.allergens,
                foodItem.perishable,
                id
            ]
        );
        return result.affectedRows > 0 ? { id, ...foodItem } : null;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM FOOD_ITEMS WHERE food_id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = FoodType;