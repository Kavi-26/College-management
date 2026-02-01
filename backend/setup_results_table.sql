-- ==========================================
-- Results / Marks Schema
-- ==========================================

USE college_db;

CREATE TABLE IF NOT EXISTS results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    exam_type ENUM('Mid-Term', 'Final', 'Assignment', 'Internal') NOT NULL,
    marks_obtained DECIMAL(5, 2) NOT NULL, -- e.g., 85.50
    max_marks DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    grade VARCHAR(2), -- Calculated: A, B, C, F
    semester VARCHAR(10) NOT NULL,
    remarks TEXT,
    published_by INT, -- Faculty ID
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (published_by) REFERENCES faculty(id)
    -- Ideally link subject_code to subjects(code), but for now we keep it flexible or we can enforce it if setup_reference_data runs first.
    -- FOREIGN KEY (subject_code) REFERENCES subjects(code)
);
