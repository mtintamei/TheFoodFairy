const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const { email, password } = req.body;

    let sql = 'SELECT * FROM USERS WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (result.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { 
                id: result[0].id, 
                role: result[0].role 
            }, 
            process.env.JWT_SECRET || 'your-secret-key', // Fallback secret for development
            { 
                expiresIn: '24h' 
            }
        );
        
        return res.json({ 
            message: 'Login successful', 
            token,
            user: {
                id: result[0].id,
                email: result[0].email,
                role: result[0].role
            }
        });
    });
};