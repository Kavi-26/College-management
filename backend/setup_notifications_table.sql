-- ==========================================
-- Notifications Schema
-- ==========================================

USE college_db;

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Recipient
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('attendance', 'result', 'event', 'chat', 'notice', 'general') DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    related_id INT, -- ID of the related entity (e.g., event_id)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- Foreign key to user tables is tricky because user_id could be student/faculty. 
    -- For simplicity, we won't enforce FK here or we could have a central 'users' table.
    -- Assuming we manage integrity in app logic.
);
