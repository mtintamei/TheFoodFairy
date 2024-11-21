-- Create the database
DROP DATABASE IF EXISTS food_distribution;
CREATE DATABASE food_distribution;
USE food_distribution;

-- DONORS table
CREATE TABLE DONORS (
    donor_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('restaurant', 'store', 'hotel', 'other') NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- RECIPIENTS table
CREATE TABLE RECIPIENTS (
    recipient_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('food_bank', 'shelter', 'school', 'community_center', 'other') NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    capacity INT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FOOD_ITEMS table
CREATE TABLE FOOD_ITEMS (
    food_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('fresh', 'packaged', 'prepared') NOT NULL,
    unit ENUM('kg', 'items', 'portions') NOT NULL,
    shelf_life_days INT,
    storage_type ENUM('room_temp', 'refrigerated', 'frozen') NOT NULL,
    allergens TEXT,
    perishable BOOLEAN DEFAULT FALSE
);

-- VOLUNTEERS table
CREATE TABLE VOLUNTEERS (
    volunteer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL, -- When can you start?
    address TEXT NOT NULL, -- Where do you Live?
    why_volunteer TEXT NOT NULL, -- Why do you want to volunteer with Food Fairy?
    status ENUM('active', 'inactive', 'pending_verification') DEFAULT 'pending_verification',
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    background_check ENUM('pending', 'approved', 'expired') DEFAULT 'pending'
);

-- ROUTES table
CREATE TABLE ROUTES (
    route_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    start_location TEXT NOT NULL,
    end_location TEXT NOT NULL,
    distance_km DECIMAL(10,2) NOT NULL,
    estimated_duration_mins INT NOT NULL,
    preferred_vehicle_type VARCHAR(50),
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- DONATIONS table
CREATE TABLE DONATIONS (
    donation_id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT NOT NULL,
    recipient_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    donation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    pickup_time DATETIME,
    delivery_time DATETIME,
    status ENUM('pending', 'in_transit', 'delivered', 'rejected') DEFAULT 'pending',
    condition_on_delivery VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (donor_id) REFERENCES DONORS(donor_id),
    FOREIGN KEY (recipient_id) REFERENCES RECIPIENTS(recipient_id),
    FOREIGN KEY (food_id) REFERENCES FOOD_ITEMS(food_id)
);

-- DELIVERIES table
CREATE TABLE DELIVERIES (
    delivery_id INT PRIMARY KEY AUTO_INCREMENT,
    donation_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    route_id INT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    status ENUM('scheduled', 'in_progress', 'completed') DEFAULT 'scheduled',
    notes TEXT,
    FOREIGN KEY (donation_id) REFERENCES DONATIONS(donation_id),
    FOREIGN KEY (volunteer_id) REFERENCES VOLUNTEERS(volunteer_id),
    FOREIGN KEY (route_id) REFERENCES ROUTES(route_id)
);

-- FEEDBACK table
CREATE TABLE FEEDBACK (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    donation_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    type ENUM('donor', 'recipient', 'volunteer') NOT NULL,
    feedback_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    action_taken TEXT,
    FOREIGN KEY (donation_id) REFERENCES DONATIONS(donation_id)
);

-- CASH_DONATIONS table
CREATE TABLE CASH_DONATIONS (
    cash_donation_id INT PRIMARY KEY AUTO_INCREMENT,
    donor_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    donation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processed') DEFAULT 'pending'
);

-- USERS table
CREATE TABLE IF NOT EXISTS USERS (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('donor', 'volunteer', 'recipient', 'admin') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS table
CREATE TABLE NOTIFICATIONS (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);

-- Insert sample DONORS
INSERT INTO DONORS (name, type, contact_person, phone, email, address, status) VALUES
('Fresh Harvest Restaurant', 'restaurant', 'John Smith', '+254722111000', 'john@fresharvest.co.ke', '123 Kimathi Street, Nairobi', 'active'),
('Metro Supermarket', 'store', 'Sarah Kamau', '+254733222111', 'sarah.k@metro.co.ke', '45 Tubman Road, Nairobi', 'active'),
('Serena Hotel', 'hotel', 'Michael Omondi', '+254711333222', 'michael.o@serena.com', '234 Uhuru Highway, Nairobi', 'active'),
('Green Grocers Ltd', 'store', 'Jane Wanjiku', '+254744444333', 'jane@greengrocers.co.ke', '78 Moi Avenue, Nairobi', 'active');

-- Insert sample RECIPIENTS
INSERT INTO RECIPIENTS (name, type, contact_person, phone, email, address, capacity, status) VALUES
('Hope Children\'s Home', 'shelter', 'Mary Njeri', '+254755555444', 'mary@hopehome.org', '56 Ngong Road, Nairobi', 100, 'active'),
('Community Food Bank', 'food_bank', 'Peter Kipchoge', '+254766666555', 'peter@communityfb.org', '89 Langata Road, Nairobi', 500, 'active'),
('St. Johns School', 'school', 'Agnes Mutua', '+254777777666', 'agnes@stjohns.edu', '12 School Lane, Nairobi', 300, 'active'),
('Upendo Center', 'community_center', 'David Mwangi', '+254788888777', 'david@upendo.org', '34 Community Road, Nairobi', 200, 'active');

-- Insert sample FOOD_ITEMS
INSERT INTO FOOD_ITEMS (name, category, unit, shelf_life_days, storage_type, allergens, perishable) VALUES
('Rice', 'packaged', 'kg', 365, 'room_temp', NULL, FALSE),
('Fresh Vegetables', 'fresh', 'kg', 7, 'refrigerated', NULL, TRUE),
('Bread', 'packaged', 'items', 5, 'room_temp', 'gluten', TRUE),
('Chicken Stew', 'prepared', 'portions', 3, 'refrigerated', NULL, TRUE),
('Milk', 'fresh', 'items', 7, 'refrigerated', 'lactose', TRUE),
('Canned Beans', 'packaged', 'items', 365, 'room_temp', NULL, FALSE);

-- Insert sample VOLUNTEERS
INSERT INTO VOLUNTEERS (first_name, last_name, email, gender, phone, start_date, address, why_volunteer, status, background_check) VALUES
('Tom', 'Kimani', 'tom.k@email.com', 'male', '+254799999888', '2024-01-15', '67 Volunteer Street, Nairobi', 'Want to help reduce food waste and hunger', 'active', 'approved'),
('Lucy', 'Akinyi', 'lucy.a@email.com', 'female', '+254700000999', '2024-01-20', '90 Helper Road, Nairobi', 'Passionate about community service', 'active', 'approved'),
('James', 'Ochieng', 'james.o@email.com', 'male', '+254711111000', '2024-02-01', '23 Service Lane, Nairobi', 'Looking to make a difference', 'active', 'approved');

-- Insert sample ROUTES
INSERT INTO ROUTES (name, start_location, end_location, distance_km, estimated_duration_mins, preferred_vehicle_type, status) VALUES
('Route A', 'CBD Nairobi', 'Ngong Road', 8.5, 30, 'Van', 'active'),
('Route B', 'Westlands', 'Langata', 12.3, 45, 'Truck', 'active'),
('Route C', 'Karen', 'Kilimani', 10.1, 35, 'Van', 'active');

-- Insert sample USERS
INSERT INTO USERS (email, password, role) VALUES
('mtintamei@gmail.com', 'admin123', 'admin');


-- Insert sample DONATIONS
INSERT INTO DONATIONS (donor_id, recipient_id, food_id, quantity, pickup_time, delivery_time, status) VALUES
(1, 1, 2, 25.5, '2024-01-15 09:00:00', '2024-01-15 10:30:00', 'delivered'),
(2, 2, 1, 100.0, '2024-01-16 14:00:00', '2024-01-16 15:30:00', 'delivered'),
(3, 3, 4, 50.0, '2024-01-17 11:00:00', '2024-01-17 12:30:00', 'in_transit'),
(4, 4, 3, 75.0, '2024-01-18 13:00:00', NULL, 'pending');

-- Insert sample DELIVERIES
INSERT INTO DELIVERIES (donation_id, volunteer_id, route_id, start_time, end_time, status) VALUES
(1, 1, 1, '2024-01-15 09:30:00', '2024-01-15 10:30:00', 'completed'),
(2, 2, 2, '2024-01-16 14:30:00', '2024-01-16 15:30:00', 'completed'),
(3, 3, 3, '2024-01-17 11:30:00', NULL, 'in_progress');

-- Insert sample FEEDBACK
INSERT INTO FEEDBACK (donation_id, rating, comment, type) VALUES
(1, 5, 'Food was fresh and delivery was on time', 'recipient'),
(1, 4, 'Great volunteer service', 'donor'),
(2, 5, 'Excellent coordination and communication', 'volunteer');

-- Insert sample CASH_DONATIONS
INSERT INTO CASH_DONATIONS (donor_name, email, phone, amount, status) VALUES
('Alice Waruga', 'alice@email.com', '+254722333444', 5000.00, 'processed'),
('Bob Gitonga', 'bob@email.com', '+254733444555', 10000.00, 'processed'),
('Carol Muthoni', 'carol@email.com', '+254744555666', 7500.00, 'pending');

