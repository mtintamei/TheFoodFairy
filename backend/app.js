const express = require('express');
const app = express();
const deliveryRoutes = require('./routes/deliveryRoutes');

// ... other middleware ...

// Mount the routes
app.use('/', deliveryRoutes);  // This will handle all routes defined in deliveryRoutes.js

// ... rest of the server setup ... 