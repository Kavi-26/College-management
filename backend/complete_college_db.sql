-- ==========================================
-- Smart College Companion - Complete Database Setup (BCA ONLY)
-- ==========================================

DROP DATABASE IF EXISTS college_db;
CREATE DATABASE college_db;
USE college_db;

-- ==========================================
-- 1. Reference Data (Lookup Tables)
-- ==========================================

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Years
CREATE TABLE IF NOT EXISTS years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sections
CREATE TABLE IF NOT EXISTS sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type ENUM('Regular', 'Lab') DEFAULT 'Regular',
    department_code VARCHAR(10),
    year_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_code) REFERENCES departments(code)
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_no VARCHAR(50) NOT NULL UNIQUE,
    building VARCHAR(50),
    capacity INT,
    type ENUM('Classroom', 'Lab', 'Auditorium') DEFAULT 'Classroom',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Reference Data (BCA ONLY)
INSERT INTO departments (code, name) VALUES 
('BCA', 'Bachelor of Computer Applications');

INSERT INTO years (code, name) VALUES 
('I', 'First Year'),
('II', 'Second Year'),
('III', 'Third Year');

INSERT INTO sections (code, name) VALUES 
('A', 'Section A'),
('B', 'Section B'),
('C', 'Section C');

INSERT INTO subjects (code, name, type, department_code, year_code) VALUES 
('WP', 'Web Programming', 'Regular', 'BCA', 'III'),
('DBMS', 'Database Management', 'Regular', 'BCA', 'III'),
('MATH', 'Mathematics', 'Regular', 'BCA', 'III'),
('CC', 'Cloud Computing', 'Regular', 'BCA', 'III'),
('WP_LAB', 'Web Programming Lab', 'Lab', 'BCA', 'III'),
('DBMS_LAB', 'DBMS Lab', 'Lab', 'BCA', 'III'),
('ENG', 'English', 'Regular', 'BCA', 'III');

INSERT INTO rooms (room_no, building, capacity, type) VALUES 
('LH-101', 'Main Block', 60, 'Classroom'),
('LH-102', 'Main Block', 60, 'Classroom'),
('LAB-1', 'Lab Block', 30, 'Lab'),
('LAB-2', 'Lab Block', 30, 'Lab');


-- ==========================================
-- 2. User Tables
-- ==========================================

-- Admin Table
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    reg_no VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL,
    section VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Users
-- Admin
INSERT INTO admin (name, email, password) VALUES
('Principal Admin', 'admin@college.edu', 'admin123');

-- Faculty (BCA ONLY)
INSERT INTO faculty (id, name, email, password, department, designation) VALUES
(1, 'Dr. Arun Kumar', 'arun.bca@college.edu', '123456', 'BCA', 'HOD'),
(2, 'Prof. Priya Sharma', 'priya.bca@college.edu', '123456', 'BCA', 'Assistant Professor'),
(3, 'Prof. Rajesh Singh', 'rajesh.bca@college.edu', '123456', 'BCA', 'Assistant Professor'),
(4, 'Prof. Sneha Gupta', 'sneha.bca@college.edu', '123456', 'BCA', 'Associate Professor'),
(5, 'Prof. Kavita Reddy', 'kavita.bca@college.edu', '123456', 'BCA', 'Lab Instructor');

-- Students (BCA ONLY)
INSERT INTO students (name, email, password, reg_no, department, year, section) VALUES
('Kavi', 'kavi@college.edu', '20042005', 'BCA001', 'BCA', 'III', 'A'),
('Abi', 'abi@college.edu', '10052005', 'BCA002', 'BCA', 'III', 'A'),
('Rahul Verma', 'rahul.bca@college.edu', '123456', 'BCA003', 'BCA', 'II', 'B'),
('Amit Patel', 'amit.bca@college.edu', '123456', 'BCA005', 'BCA', 'III', 'A'),
('Sneha Reddy', 'sneha.bca@college.edu', '123456', 'BCA006', 'BCA', 'III', 'A');


-- ==========================================
-- 3. Core Academic Modules
-- ==========================================

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    period INT NOT NULL CHECK (period BETWEEN 1 AND 6),
    subject VARCHAR(100) NOT NULL,
    status ENUM('Present', 'Absent', 'On Duty') NOT NULL,
    faculty_id INT NOT NULL, 
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id)
);

-- Timetable Table
CREATE TABLE IF NOT EXISTS timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    period INT NOT NULL CHECK (period BETWEEN 1 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(100) NOT NULL,
    faculty_id INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL,
    section VARCHAR(10) NOT NULL,
    room_no VARCHAR(50),
    FOREIGN KEY (faculty_id) REFERENCES faculty(id),
    UNIQUE KEY unique_schedule (day_of_week, period, department, year, section)
);

-- Seed Timetable (Monday: 4 Regular + 2 Lab)
INSERT INTO timetable (day_of_week, period, start_time, end_time, subject, faculty_id, department, year, section, room_no) VALUES
('Monday', 1, '09:00:00', '10:00:00', 'Web Programming', 1, 'BCA', 'III', 'A', 'LH-101'),     -- Faculty 1 (Arun)
('Monday', 2, '10:00:00', '11:00:00', 'Database Management', 2, 'BCA', 'III', 'A', 'LH-101'), -- Faculty 2 (Priya)
('Monday', 3, '11:15:00', '12:15:00', 'Mathematics', 3, 'BCA', 'III', 'A', 'LH-101'),         -- Faculty 3 (Rajesh)
('Monday', 4, '12:15:00', '13:15:00', 'Cloud Computing', 4, 'BCA', 'III', 'A', 'LH-101'),     -- Faculty 4 (Sneha)
('Monday', 5, '14:00:00', '15:00:00', 'Web Programming Lab', 5, 'BCA', 'III', 'A', 'LAB-1'),  -- Faculty 5 (Kavita)
('Monday', 6, '15:00:00', '16:00:00', 'Web Programming Lab', 5, 'BCA', 'III', 'A', 'LAB-1');  -- Faculty 5 (Kavita)

-- Seed Attendance
INSERT INTO attendance (student_id, date, period, subject, status, faculty_id) VALUES
(1, CURDATE(), 1, 'Web Programming', 'Present', 1),
(1, CURDATE(), 2, 'Database Management', 'Present', 2),
(1, CURDATE(), 3, 'Mathematics', 'Present', 3),
(1, CURDATE(), 4, 'Cloud Computing', 'Present', 4),
(1, CURDATE(), 5, 'Web Programming Lab', 'Present', 5),
(1, CURDATE(), 6, 'Web Programming Lab', 'Present', 5),
(2, CURDATE(), 1, 'Web Programming', 'Absent', 1);


-- ==========================================
-- 4. Communication & Notices
-- ==========================================

-- Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('General', 'Exam', 'Holiday', 'Event', 'Emergency') DEFAULT 'General',
    target_audience ENUM('All', 'Student', 'Faculty') DEFAULT 'All',
    attachment_path VARCHAR(500), 
    posted_by_id INT NOT NULL,
    posted_by_name VARCHAR(255) NOT NULL,
    posted_by_role ENUM('admin', 'faculty') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_pinned BOOLEAN DEFAULT FALSE
);

-- Community Chat Messages
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_role ENUM('student', 'faculty', 'admin') NOT NULL,
    text TEXT NOT NULL,
    room VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, 
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('attendance', 'result', 'event', 'chat', 'notice', 'general') DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    related_id INT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Notices
INSERT INTO notices (title, content, type, target_audience, posted_by_id, posted_by_name, posted_by_role) VALUES
('Mid-Semester Exams', 'Mid-sem exams start from next Monday.', 'Exam', 'Student', 1, 'Principal Admin', 'admin'),
('Technical Seminar', 'A seminar on AI is arranged for BCA III year.', 'Event', 'Student', 2, 'Prof. Priya Sharma', 'faculty');


-- ==========================================
-- 5. Events & Activities
-- ==========================================

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    location VARCHAR(255),
    organizer VARCHAR(255),
    created_by INT, -- Admin ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin(id)
);

-- Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    student_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (event_id, student_id)
);

-- Seed Events
INSERT INTO events (title, description, date, location, organizer, created_by) VALUES
('Tech Symposium 2026', 'Annual tech fest.', '2026-03-15 10:00:00', 'Main Auditorium', 'BCA Department', 1);


-- ==========================================
-- 6. Results & Resources
-- ==========================================

-- Results Table
CREATE TABLE IF NOT EXISTS results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    exam_type ENUM('Mid-Term', 'Final', 'Assignment', 'Internal') NOT NULL,
    marks_obtained DECIMAL(5, 2) NOT NULL,
    max_marks DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    grade VARCHAR(2), 
    semester VARCHAR(10) NOT NULL,
    remarks TEXT,
    published_by INT,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (published_by) REFERENCES faculty(id)
);

-- Academic Resources
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    year VARCHAR(20) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Results
INSERT INTO results (student_id, subject_code, exam_type, marks_obtained, max_marks, grade, semester, published_by) VALUES
(1, 'WP', 'Final', 85.00, 100.00, 'A', 'Sem 5', 2);
