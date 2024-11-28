require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');
const authMiddleware = require('./middleware/authMiddleware');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: ['http://127.0.0.1:5501', 'http://localhost:5501'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Authorization']
}));

// Import routes
const donorRoutes = require('./routes/donorRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const foodTypeRoutes = require('./routes/foodTypeRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');

// Routes configuration
app.use('/api/auth', authRoutes);
app.use('/api/donors', authMiddleware, donorRoutes);
app.use('/api/beneficiaries', authMiddleware, beneficiaryRoutes);
app.use('/api/food-types', authMiddleware, foodTypeRoutes);
app.use('/api/employees', authMiddleware, employeeRoutes);
app.use('/api/deliveries', authMiddleware, deliveryRoutes);
app.use('/api/volunteers', volunteerRoutes); // Single mount point for volunteer routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date(),
        services: {
            database: 'connected'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Resource not found',
        path: req.path
    });
});

// JWT error handler
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            message: 'Invalid token or no token provided'
        });
    }
    next(err);
});

// General error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle specific database errors
    if (err.code === 'ER_DATA_TOO_LONG' || err.code === 'ER_DATA_TRUNCATED') {
        return res.status(400).json({
            message: 'Invalid data provided',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    
    // Handle other errors
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// Serve static files from frontend directory
app.use(express.static('frontend'));

// Test database connection
db.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    });

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    if (process.env.NODE_ENV === 'development') {
        process.exit(1);
    }
});

module.exports = app; 