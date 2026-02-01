-- ==========================================
-- Reference Data Tables for Smart College App
-- ==========================================

USE college_db;

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Years Table
CREATE TABLE IF NOT EXISTS years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sections Table
CREATE TABLE IF NOT EXISTS sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects Table
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

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_no VARCHAR(50) NOT NULL UNIQUE,
    building VARCHAR(50),
    capacity INT,
    type ENUM('Classroom', 'Lab', 'Auditorium') DEFAULT 'Classroom',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Departments
INSERT INTO departments (code, name) VALUES 
    ('BCA', 'Bachelor of Computer Applications'),
    ('MCA', 'Master of Computer Applications'),
    ('CSE', 'Computer Science and Engineering')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Default Years
INSERT INTO years (code, name) VALUES 
    ('I', 'First Year'),
    ('II', 'Second Year'),
    ('III', 'Third Year'),
    ('IV', 'Fourth Year')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Default Sections
INSERT INTO sections (code, name) VALUES 
    ('A', 'Section A'),
    ('B', 'Section B'),
    ('C', 'Section C')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Sample Subjects
INSERT INTO subjects (code, name, type, department_code, year_code) VALUES 
    ('WP', 'Web Programming', 'Regular', 'BCA', 'III'),
    ('WP_LAB', 'Web Programming Lab', 'Lab', 'BCA', 'III'),
    ('DBMS', 'Database Management', 'Regular', 'BCA', 'III'),
    ('DBMS_LAB', 'DBMS Lab', 'Lab', 'BCA', 'III'),
    ('MATH', 'Mathematics', 'Regular', 'BCA', 'III'),
    ('ENG', 'English', 'Regular', 'BCA', 'III'),
    ('CC', 'Cloud Computing', 'Regular', 'BCA', 'III'),
    ('MP', 'Mini Project', 'Lab', 'BCA', 'III')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Sample Rooms
INSERT INTO rooms (room_no, building, capacity, type) VALUES 
    ('LH-101', 'Main Block', 60, 'Classroom'),
    ('LH-102', 'Main Block', 60, 'Classroom'),
    ('LAB-1', 'Lab Block', 30, 'Lab'),
    ('LAB-2', 'Lab Block', 30, 'Lab'),
    ('LAB-3', 'Lab Block', 30, 'Lab')
ON DUPLICATE KEY UPDATE building=VALUES(building);
