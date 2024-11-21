require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://127.0.0.1:5501', 'http://localhost:5501'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Routes
const donorRoutes = require('./routes/donorRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const distributionRoutes = require('./routes/distributionRoutes');
const foodTypeRoutes = require('./routes/foodTypeRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');

app.use('/donors', donorRoutes);
app.use('/beneficiaries', beneficiaryRoutes);
app.use('/centers', distributionRoutes);
app.use('/foodtypes', foodTypeRoutes);
app.use('/deliveries', deliveryRoutes);
app.use('/employees', employeeRoutes);
app.use('/volunteers', volunteerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});