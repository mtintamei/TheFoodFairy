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
    food_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    donation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    pickup_time DATETIME,
    status ENUM('pending', 'assigned', 'completed', 'rejected') DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (donor_id) REFERENCES DONORS(donor_id),
    FOREIGN KEY (food_id) REFERENCES FOOD_ITEMS(food_id)
);

-- DONATION_ASSIGNMENTS table
CREATE TABLE DONATION_ASSIGNMENTS (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    donation_id INT NOT NULL,
    recipient_id INT NOT NULL,
    route_id INT NOT NULL,
    assigned_quantity DECIMAL(10,2) NOT NULL,
    scheduled_delivery_date DATETIME NOT NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'delayed', 'failed') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES DONATIONS(donation_id),
    FOREIGN KEY (recipient_id) REFERENCES RECIPIENTS(recipient_id),
    FOREIGN KEY (route_id) REFERENCES ROUTES(route_id)
);

-- DELIVERIES table
CREATE TABLE DELIVERIES (
    delivery_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    volunteer_id INT NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'delayed', 'failed') DEFAULT 'scheduled',
    start_time DATETIME NULL,
    end_time DATETIME NULL,
    condition_on_delivery TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES DONATION_ASSIGNMENTS(assignment_id),
    FOREIGN KEY (volunteer_id) REFERENCES VOLUNTEERS(volunteer_id)
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

-- Update DELIVERIES table status ENUM
ALTER TABLE DELIVERIES 
MODIFY COLUMN status ENUM('scheduled', 'in_progress', 'completed', 'delayed', 'failed') 
DEFAULT 'scheduled';

-- Add 'delayed' to DONATION_ASSIGNMENTS status ENUM
ALTER TABLE DONATION_ASSIGNMENTS 
MODIFY COLUMN status ENUM('scheduled', 'in_progress', 'completed', 'delayed', 'failed') 
DEFAULT 'scheduled';

