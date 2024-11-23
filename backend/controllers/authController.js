const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query(
            'SELECT user_id, email, password, role FROM USERS WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = users[0];

        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { 
                id: user.user_id, 
                role: user.role 
            }, 
            process.env.JWT_SECRET || 'your-secret-key',
            { 
                expiresIn: '24h' 
            }
        );
        
        return res.json({ 
            message: 'Login successful', 
            token,
            user: {
                id: user.user_id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};