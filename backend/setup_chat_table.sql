-- ==========================================
-- Community Chat Schema
-- ==========================================

USE college_db;

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_role ENUM('student', 'faculty', 'admin') NOT NULL,
    text TEXT NOT NULL,
    room VARCHAR(50) NOT NULL, -- e.g., 'BCA-III-A', 'General'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
