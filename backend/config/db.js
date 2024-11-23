// backend/config/db.js

const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create a connection pool instead of a single connection
const pool = mysql.createPool(dbConfig);

// Test the connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
};

// Initial connection test
testConnection();

module.exports = pool;