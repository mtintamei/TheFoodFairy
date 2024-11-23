const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. Invalid token format.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Verify user still exists and is active in database
        const [users] = await db.query(
            'SELECT user_id, email, role FROM USERS WHERE user_id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'User no longer exists.' });
        }

        // Add user info to request
        req.user = {
            id: users[0].user_id,
            email: users[0].email,
            role: users[0].role
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;