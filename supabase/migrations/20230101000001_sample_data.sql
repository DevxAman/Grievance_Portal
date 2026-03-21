-- Clear existing data (in correct order to maintain referential integrity)
DELETE FROM responses;
DELETE FROM grievances;
DELETE FROM statistics;
DELETE FROM users;

-- Insert sample users with plain text passwords (all passwords are 'password123')
INSERT INTO users (user_id, email, password, role, name, contact_number) VALUES
('S001', 'student1@example.com', 'password123', 'student', 'John Doe', '1234567890'),
('S002', 'student2@example.com', 'password123', 'student', 'Jane Smith', '9876543210'),
('C001', 'clerk1@example.com', 'password123', 'clerk', 'Mike Johnson', '5551234567'),
('A001', 'admin1@example.com', 'password123', 'admin', 'Sarah Wilson', '5559876543'),
('D001', 'dsw1@example.com', 'password123', 'dsw', 'David Brown', '5554567890');

-- Insert sample grievances
INSERT INTO grievances (user_id, title, description, category, status, assigned_to) VALUES
(
    (SELECT id FROM users WHERE user_id = 'S001'),
    'Library Books Not Available',
    'The required textbooks for my course are not available in the library.',
    'academic',
    'pending',
    (SELECT id FROM users WHERE user_id = 'C001')
),
(
    (SELECT id FROM users WHERE user_id = 'S002'),
    'Hostel WiFi Issues',
    'The WiFi connection in the hostel is very slow and keeps disconnecting.',
    'infrastructure',
    'under-review',
    (SELECT id FROM users WHERE user_id = 'C001')
),
(
    (SELECT id FROM users WHERE user_id = 'S001'),
    'Mess Food Quality',
    'The quality of food in the mess has deteriorated recently.',
    'administrative',
    'in-progress',
    (SELECT id FROM users WHERE user_id = 'D001')
);

-- Insert sample responses
INSERT INTO responses (grievance_id, admin_id, response_text) VALUES
(
    (SELECT id FROM grievances WHERE title = 'Library Books Not Available'),
    (SELECT id FROM users WHERE user_id = 'C001'),
    'We have ordered the books and they will be available in 2 weeks.'
),
(
    (SELECT id FROM grievances WHERE title = 'Hostel WiFi Issues'),
    (SELECT id FROM users WHERE user_id = 'C001'),
    'We are aware of the issue and our IT team is working on it.'
),
(
    (SELECT id FROM grievances WHERE title = 'Mess Food Quality'),
    (SELECT id FROM users WHERE user_id = 'D001'),
    'We have scheduled a meeting with the mess committee to address this issue.'
);

-- Insert initial statistics record
INSERT INTO statistics (resolution_rate, avg_response_time, grievances_resolved, user_satisfaction, last_updated)
VALUES (33.33, 2, 1, 75.00, CURRENT_TIMESTAMP); 