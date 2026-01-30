-- ==========================================
-- Smart College Companion App - Full Database Setup (Refactored)
-- ==========================================

CREATE DATABASE IF NOT EXISTS college_db;
USE college_db;

-- 1. Admin Table
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    reg_no VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL, -- e.g., 'I', 'II', 'III', 'IV'
    section VARCHAR(10) NOT NULL, -- e.g., 'A', 'B'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    subject VARCHAR(100) NOT NULL,
    status ENUM('Present', 'Absent', 'On Duty') NOT NULL,
    faculty_id INT NOT NULL, -- Marked by Faculty
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id)
);

-- 5. Timetable Table
CREATE TABLE IF NOT EXISTS timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(100) NOT NULL,
    faculty_id INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL,
    section VARCHAR(10) NOT NULL,
    room_no VARCHAR(50),
    FOREIGN KEY (faculty_id) REFERENCES faculty(id)
);

-- 6. Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('General', 'Exam', 'Holiday', 'Event') DEFAULT 'General',
    posted_by_admin_id INT,
    posted_by_faculty_id INT,
    target_audience ENUM('All', 'Students', 'Faculty') DEFAULT 'All',
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by_admin_id) REFERENCES admin(id),
    FOREIGN KEY (posted_by_faculty_id) REFERENCES faculty(id)
);

-- 7. Results / Marks Table
CREATE TABLE IF NOT EXISTS results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    marks_obtained INT NOT NULL,
    max_marks INT DEFAULT 100,
    grade VARCHAR(5),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 8. Events Table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location VARCHAR(255),
    organizer_admin_id INT,
    organizer_faculty_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_admin_id) REFERENCES admin(id),
    FOREIGN KEY (organizer_faculty_id) REFERENCES faculty(id)
);

-- 9. Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    student_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 10. Community Chat / Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL, -- Generic ID, frontend/backend must handle identity
    sender_role ENUM('admin', 'faculty', 'student') NOT NULL,
    message TEXT NOT NULL,
    group_name VARCHAR(100) NOT NULL, -- e.g., 'CSE-IV-A' or 'Faculty-CSE'
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Notifications
-- Hard to maintain strict FK to multiple tables easily without polymorphism or multiple columns.
-- Using composite referencing (user_id + user_role) for simplicity in this module, or multiple nullable FK columns.
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    faculty_id INT,
    admin_id INT,
    message VARCHAR(255) NOT NULL,
    type ENUM('Info', 'Warning', 'Success') DEFAULT 'Info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE
);

-- 12. Academic Resources
CREATE TABLE IF NOT EXISTS academic_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    faculty_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
);

-- ==========================================
-- SEED DATA
-- Password for all users: 'password123'
-- Hash: $2b$10$IVLvnnebc1HJf3prgCRYEuXIa0ZTfiESYnb8RewhI3IvIVpBtWnKm
-- ==========================================

-- 1. Insert Admin
INSERT INTO admin (name, email, password) VALUES
('Admin', 'admin@college.edu', 'admin123');

-- 2. Insert Faculty
INSERT INTO faculty (name, email, password, department, designation) VALUES
('Ram', 'faculty@college.edu', 'ram123', 'CSE', 'Assistant Professor');

-- 3. Insert Students
-- Passwords are set to dummy DOBs (DDMMYYYY)
INSERT INTO students (name, email, password, reg_no, department, year, section) VALUES
('Kavi', 'kavi@college.edu', '20042005', 'STU001', 'CSE', 'IV', 'A'),
('Abi', 'abi@college.edu', '10052005', 'STU002', 'CSE', 'IV', 'A');

-- 4. Attendance
INSERT INTO attendance (student_id, date, subject, status, faculty_id) VALUES
(1, CURDATE(), 'Computer Networks', 'Present', 1),
(1, CURDATE(), 'Web Development', 'Present', 1),
(2, CURDATE(), 'Computer Networks', 'Absent', 1);

-- 5. Timetable
INSERT INTO timetable (day_of_week, start_time, end_time, subject, faculty_id, department, year, section, room_no) VALUES
('Monday', '09:00:00', '10:00:00', 'Computer Networks', 1, 'CSE', 'IV', 'A', 'CS-101'),
('Monday', '10:00:00', '11:00:00', 'Web Development', 1, 'CSE', 'IV', 'A', 'Lab-2');

-- 6. Notices
INSERT INTO notices (title, content, category, posted_by_admin_id, target_audience, expiry_date) VALUES
('Mid-Semester Exams', 'Mid-sem exams start from next Monday.', 'Exam', 1, 'Students', DATE_ADD(CURDATE(), INTERVAL 10 DAY));

INSERT INTO notices (title, content, category, posted_by_admin_id, target_audience, expiry_date) VALUES
('Holiday Announcement', 'College remains closed tomorrow due to heavy rain.', 'Holiday', 1, 'All', DATE_ADD(CURDATE(), INTERVAL 1 DAY));

-- 7. Results
INSERT INTO results (student_id, semester, subject, marks_obtained, max_marks, grade) VALUES
(1, 'Sem 6', 'Computer Networks', 85, 100, 'A'),
(1, 'Sem 6', 'Web Development', 92, 100, 'S'),
(2, 'Sem 6', 'Computer Networks', 45, 100, 'E');

-- 8. Events
INSERT INTO events (name, description, event_date, location, organizer_faculty_id) VALUES
('Tech Symposium 2026', 'Annual tech fest.', '2026-03-15 10:00:00', 'Auditorium', 1);

-- 9. Resources
INSERT INTO academic_resources (title, description, subject, faculty_id, file_path, file_type) VALUES
('CN Unit 1 Notes', 'Introduction to Networks', 'Computer Networks', 1, '/uploads/cn_unit1.pdf', 'pdf');
