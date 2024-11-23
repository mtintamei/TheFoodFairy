USE food_distribution;

-- Insert sample USERS
INSERT INTO USERS (email, password, role) VALUES
('mtintamei@gmail.com', 'admin123', 'admin'),
('admin@foodfairy.com', 'admin123', 'admin');

-- Insert ROUTES data
INSERT INTO ROUTES (name, start_location, end_location, distance_km, estimated_duration_mins, preferred_vehicle_type, status) VALUES
('Westlands Route', 'CBD Nairobi', 'Westlands', 8.5, 45, 'van', 'active'),
('CBD Route', 'Westlands', 'CBD', 6.2, 30, 'motorcycle', 'active'),
('Eastern Route', 'CBD', 'Eastlands', 12.3, 60, 'van', 'active'),
('Southern Route', 'CBD', 'Karen', 15.1, 45, 'car', 'active'),
('Northern Route', 'CBD', 'Parklands', 7.4, 40, 'motorcycle', 'active');

-- Insert VOLUNTEERS data
INSERT INTO VOLUNTEERS (first_name, last_name, email, gender, phone, start_date, address, why_volunteer, status, background_check) VALUES
('John', 'Kamau', 'john.k@volunteer.org', 'male', '+254711222333', '2024-01-01', '123 Ngong Road, Nairobi', 'Passionate about reducing food waste', 'active', 'approved'),
('Mary', 'Wanjiku', 'mary.w@volunteer.org', 'female', '+254722333444', '2024-01-02', '456 Kilimani, Nairobi', 'Want to help my community', 'active', 'approved'),
('Peter', 'Omondi', 'peter.o@volunteer.org', 'male', '+254733444555', '2024-01-03', '789 Lavington, Nairobi', 'Love giving back to society', 'active', 'approved'),
('Sarah', 'Akinyi', 'sarah.a@volunteer.org', 'female', '+254744555666', '2024-01-04', '321 Westlands, Nairobi', 'Experienced in food distribution', 'active', 'approved'),
('James', 'Mwangi', 'james.m@volunteer.org', 'male', '+254755666777', '2024-01-05', '654 Parklands, Nairobi', 'Want to make a difference', 'active', 'approved'),
('Tom', 'Kimani', 'tom.k@email.com', 'male', '+254799999888', '2024-01-15', '67 Volunteer Street, Nairobi', 'Want to help reduce food waste and hunger', 'active', 'approved'),
('Lucy', 'Akinyi', 'lucy.a@email.com', 'female', '+254700000999', '2024-01-20', '90 Helper Road, Nairobi', 'Passionate about community service', 'active', 'approved'),
('James', 'Ochieng', 'james.o@email.com', 'male', '+254711111000', '2024-02-01', '23 Service Lane, Nairobi', 'Looking to make a difference', 'active', 'approved');

-- Insert DONORS data
INSERT INTO DONORS (name, type, contact_person, phone, email, address, status) VALUES
('Nakumatt Heights', 'store', 'Daniel Maina', '+254722123456', 'daniel@nakumatt.co.ke', '456 Mombasa Road, Nairobi', 'active'),
('Java House Karen', 'restaurant', 'Patricia Auma', '+254733987654', 'patricia@javahouse.co.ke', '789 Karen Road, Nairobi', 'active'),
('Tuskys Supermarket', 'store', 'George Njoroge', '+254712345678', 'george@tuskys.co.ke', '321 Thika Road, Nairobi', 'inactive'),
('Hilton Hotel', 'hotel', 'Rachel Wambui', '+254745678901', 'rachel@hilton.com', '567 City Center, Nairobi', 'active'),
('Artcaffe Westlands', 'restaurant', 'Hassan Omar', '+254756789012', 'hassan@artcaffe.co.ke', '890 Westlands, Nairobi', 'active'),
('Fresh Harvest Restaurant', 'restaurant', 'John Smith', '+254722111000', 'john@fresharvest.co.ke', '123 Kimathi Street, Nairobi', 'active'),
('Metro Supermarket', 'store', 'Sarah Kamau', '+254733222111', 'sarah.k@metro.co.ke', '45 Tubman Road, Nairobi', 'active'),
('Serena Hotel', 'hotel', 'Michael Omondi', '+254711333222', 'michael.o@serena.com', '234 Uhuru Highway, Nairobi', 'active'),
('Green Grocers Ltd', 'store', 'Jane Wanjiku', '+254744444333', 'jane@greengrocers.co.ke', '78 Moi Avenue, Nairobi', 'active');

-- Insert RECIPIENTS data
INSERT INTO RECIPIENTS (name, type, contact_person, phone, email, address, capacity, status) VALUES
('Kibera Food Bank', 'food_bank', 'Elizabeth Njeri', '+254778901234', 'elizabeth@kiberafb.org', '123 Kibera, Nairobi', 1000, 'active'),
('Mathare Children\'s Home', 'shelter', 'Robert Kiprono', '+254789012345', 'robert@matharechildren.org', '456 Mathare, Nairobi', 150, 'active'),
('Kangemi Youth Center', 'community_center', 'Faith Muthoni', '+254790123456', 'faith@kangemi.org', '789 Kangemi, Nairobi', 250, 'active'),
('Korogocho Primary', 'school', 'Samuel Odhiambo', '+254701234567', 'samuel@korogocho.edu', '234 Korogocho, Nairobi', 400, 'active'),
('Elderly Care Home', 'shelter', 'Grace Kemunto', '+254712345678', 'grace@elderlycare.org', '567 Kasarani, Nairobi', 75, 'active'),
('Hope Children\'s Home', 'shelter', 'Mary Njeri', '+254755555444', 'mary@hopehome.org', '56 Ngong Road, Nairobi', 100, 'active'),
('Community Food Bank', 'food_bank', 'Peter Kipchoge', '+254766666555', 'peter@communityfb.org', '89 Langata Road, Nairobi', 500, 'active'),
('St. Johns School', 'school', 'Agnes Mutua', '+254777777666', 'agnes@stjohns.edu', '12 School Lane, Nairobi', 300, 'active'),
('Upendo Center', 'community_center', 'David Mwangi', '+254788888777', 'david@upendo.org', '34 Community Road, Nairobi', 200, 'active');

-- Insert FOOD_ITEMS data
INSERT INTO FOOD_ITEMS (name, category, unit, shelf_life_days, storage_type, allergens, perishable) VALUES
('Rice', 'packaged', 'kg', 365, 'room_temp', NULL, FALSE),
('Fresh Vegetables', 'fresh', 'kg', 7, 'refrigerated', NULL, TRUE),
('Bread', 'packaged', 'items', 5, 'room_temp', 'gluten', TRUE),
('Chicken Stew', 'prepared', 'portions', 3, 'refrigerated', NULL, TRUE),
('Milk', 'fresh', 'items', 7, 'refrigerated', 'lactose', TRUE),
('Canned Beans', 'packaged', 'items', 365, 'room_temp', NULL, FALSE);

-- Insert DONATIONS data (mix of pending, assigned, and completed)
INSERT INTO DONATIONS (donor_id, food_id, quantity, donation_date, pickup_time, status, notes) VALUES
-- Morning donations (mostly assigned/completed)
(1, 2, 25.5, CURDATE(), DATE_ADD(NOW(), INTERVAL 1 HOUR), 'assigned', 'Fresh vegetables from morning harvest'),
(2, 1, 100.0, CURDATE(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'assigned', 'Rice packages from monthly surplus'),
(3, 4, 50.0, CURDATE(), DATE_ADD(NOW(), INTERVAL -2 HOUR), 'completed', 'Leftover stew from breakfast service'),
(4, 3, 75.0, CURDATE(), DATE_ADD(NOW(), INTERVAL 1 HOUR), 'pending', 'Fresh bread from morning batch'),

-- Afternoon donations (mix of pending and assigned)
(5, 5, 200.0, CURDATE(), DATE_ADD(NOW(), INTERVAL 4 HOUR), 'pending', 'Fresh milk delivery'),
(1, 6, 150.0, CURDATE(), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'pending', 'Canned goods clearance'),
(2, 2, 45.5, CURDATE(), DATE_ADD(NOW(), INTERVAL 5 HOUR), 'pending', 'Afternoon vegetable surplus'),
(3, 1, 80.0, CURDATE(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'assigned', 'Rice from lunch surplus'),

-- Evening donations (mostly pending)
(4, 4, 120.0, CURDATE(), DATE_ADD(NOW(), INTERVAL 6 HOUR), 'pending', 'Evening meal surplus'),
(5, 3, 95.0, CURDATE(), DATE_ADD(NOW(), INTERVAL 7 HOUR), 'pending', 'End of day bread'),
(1, 5, 180.0, CURDATE(), DATE_ADD(NOW(), INTERVAL 8 HOUR), 'pending', 'Dairy products near expiry'),
(2, 6, 250.0, CURDATE(), DATE_ADD(NOW(), INTERVAL 5 HOUR), 'pending', 'Weekly pantry clearance'),

-- Previous day's donations (mostly completed)
(3, 2, 75.5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 20 HOUR), 'completed', 'Yesterday\'s vegetable donation'),
(4, 1, 120.0, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 22 HOUR), 'completed', 'Yesterday\'s grain donation'),
(5, 4, 85.0, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR), 'completed', 'Yesterday\'s prepared meals'),
(1, 3, 160.0, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 21 HOUR), 'completed', 'Yesterday\'s bakery items');

-- Insert DONATION_ASSIGNMENTS data
INSERT INTO DONATION_ASSIGNMENTS (donation_id, recipient_id, route_id, scheduled_delivery_date, assigned_quantity, status) VALUES
-- Morning assignments (with various statuses)
(1, 1, 1, DATE_ADD(NOW(), INTERVAL 2 HOUR), 15.5, 'scheduled'),
(1, 2, 2, DATE_ADD(NOW(), INTERVAL 3 HOUR), 10.0, 'scheduled'),
(2, 3, 3, DATE_ADD(NOW(), INTERVAL 4 HOUR), 50.0, 'in_progress'),
(2, 4, 1, DATE_ADD(NOW(), INTERVAL 5 HOUR), 50.0, 'scheduled'),
(3, 5, 2, DATE_ADD(NOW(), INTERVAL -1 HOUR), 50.0, 'completed'),
(4, 1, 3, DATE_ADD(NOW(), INTERVAL 6 HOUR), 35.0, 'scheduled'),
(4, 2, 1, DATE_ADD(NOW(), INTERVAL 7 HOUR), 40.0, 'scheduled'),

-- Afternoon assignments
(8, 3, 2, DATE_ADD(NOW(), INTERVAL 3 HOUR), 40.0, 'in_progress'),
(8, 4, 3, DATE_ADD(NOW(), INTERVAL 4 HOUR), 40.0, 'scheduled'),

-- Previous day's assignments (all completed)
(13, 5, 1, DATE_SUB(NOW(), INTERVAL 20 HOUR), 75.5, 'completed'),
(14, 1, 2, DATE_SUB(NOW(), INTERVAL 21 HOUR), 120.0, 'completed'),
(15, 2, 3, DATE_SUB(NOW(), INTERVAL 22 HOUR), 85.0, 'completed'),
(16, 3, 1, DATE_SUB(NOW(), INTERVAL 23 HOUR), 160.0, 'completed');

-- Insert DELIVERIES data (matching assignment statuses)
INSERT INTO DELIVERIES (assignment_id, volunteer_id, start_time, end_time, status, condition_on_delivery, notes) VALUES
-- Active deliveries
(1, 1, DATE_SUB(NOW(), INTERVAL 3 HOUR), NULL, 'scheduled', NULL, 'Awaiting pickup'),
(2, NULL, NULL, NULL, 'scheduled', NULL, 'Pending volunteer assignment'),
(3, 2, DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL, 'in_progress', NULL, 'On route to destination'),
(4, NULL, NULL, NULL, 'scheduled', NULL, 'Pending volunteer assignment'),
(5, 3, DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), 'completed', 'Good', 'Delivered successfully'),
(8, 4, DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL, 'in_progress', NULL, 'Started delivery'),

-- Previous day's completed deliveries
(10, 5, DATE_SUB(NOW(), INTERVAL 20 HOUR), DATE_SUB(NOW(), INTERVAL 19 HOUR), 'completed', 'Excellent', 'Smooth delivery'),
(11, 1, DATE_SUB(NOW(), INTERVAL 21 HOUR), DATE_SUB(NOW(), INTERVAL 20 HOUR), 'completed', 'Good', 'No issues'),
(12, 2, DATE_SUB(NOW(), INTERVAL 22 HOUR), DATE_SUB(NOW(), INTERVAL 21 HOUR), 'completed', 'Good', 'Delivered as scheduled'),
(13, 3, DATE_SUB(NOW(), INTERVAL 23 HOUR), DATE_SUB(NOW(), INTERVAL 22 HOUR), 'completed', 'Excellent', 'Very efficient delivery');

-- Insert FEEDBACK data
INSERT INTO FEEDBACK (donation_id, rating, comment, type, feedback_date) VALUES
(13, 5, 'Vegetables were very fresh and well-sorted', 'recipient', DATE_SUB(NOW(), INTERVAL 19 HOUR)),
(13, 4, 'Pickup process was smooth', 'donor', DATE_SUB(NOW(), INTERVAL 19 HOUR)),
(14, 5, 'Rice quality was excellent', 'recipient', DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(14, 5, 'Very professional volunteers', 'donor', DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(15, 4, 'Food was still warm on delivery', 'recipient', DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(15, 5, 'Great communication throughout', 'volunteer', DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(16, 5, 'Timely delivery and good condition', 'recipient', DATE_SUB(NOW(), INTERVAL 22 HOUR)),
(16, 4, 'Easy donation process', 'donor', DATE_SUB(NOW(), INTERVAL 22 HOUR));

-- Insert CASH_DONATIONS data
INSERT INTO CASH_DONATIONS (donor_name, email, phone, amount, status) VALUES
('Alice Waruga', 'alice@email.com', '+254722333444', 5000.00, 'processed'),
('Bob Gitonga', 'bob@email.com', '+254733444555', 10000.00, 'processed'),
('Carol Muthoni', 'carol@email.com', '+254744555666', 7500.00, 'pending');