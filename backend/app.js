const express = require('express');
const app = express();
const deliveryRoutes = require('./routes/deliveryRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');

// ... other middleware ...

// Mount the routes
app.use('/', deliveryRoutes);  // This will handle all routes defined in deliveryRoutes.js
app.use('/volunteers', volunteerRoutes);

// ... rest of the server setup ... 