-- ==========================================
-- Resources Schema
-- ==========================================

USE college_db;

CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    year VARCHAR(20) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- pdf, doc, etc.
    uploaded_by INT NOT NULL, -- Faculty ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
