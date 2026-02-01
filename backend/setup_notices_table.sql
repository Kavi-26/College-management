-- ==========================================
-- Notice Board Schema
-- ==========================================

USE college_db;

CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('General', 'Exam', 'Holiday', 'Event', 'Emergency') DEFAULT 'General',
    target_audience ENUM('All', 'Student', 'Faculty') DEFAULT 'All',
    attachment_path VARCHAR(500), -- Path to uploaded file
    posted_by_id INT NOT NULL,
    posted_by_name VARCHAR(255) NOT NULL,
    posted_by_role ENUM('admin', 'faculty') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_pinned BOOLEAN DEFAULT FALSE
);
