const db = require('../config/db');

// Helper to calculate grade
const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'O'; // Outstanding
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'P'; // Pass
    return 'F'; // Fail
};

// Add Single Result
exports.addResult = async (req, res) => {
    try {
        const { student_id, subject_code, exam_type, marks_obtained, max_marks = 100, semester, remarks } = req.body;
        const published_by = req.user.id; // Faculty ID

        const percentage = (marks_obtained / max_marks) * 100;
        const grade = calculateGrade(percentage);

        const query = `
            INSERT INTO results (student_id, subject_code, exam_type, marks_obtained, max_marks, grade, semester, remarks, published_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [student_id, subject_code, exam_type, marks_obtained, max_marks, grade, semester, remarks, published_by]);

        res.status(201).json({ message: 'Result added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Bulk Add Results (Array of objects)
exports.bulkAddResults = async (req, res) => {
    try {
        const { results } = req.body; // Array of { student_id, marks_obtained, ... }
        const { subject_code, exam_type, max_marks = 100, semester } = req.body; // Common fields
        const published_by = req.user.id;

        // Note: For simplicity, loop insert. For high volume, use bulk insert syntax.
        for (const result of results) {
            const percentage = (result.marks_obtained / max_marks) * 100;
            const grade = calculateGrade(percentage);

            await db.query(`
                INSERT INTO results (student_id, subject_code, exam_type, marks_obtained, max_marks, grade, semester, remarks, published_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), grade = VALUES(grade), remarks = VALUES(remarks)
            `, [result.student_id, subject_code, exam_type, result.marks_obtained, max_marks, grade, semester, result.remarks || '', published_by]);
            // Note: ON DUPLICATE requires unique constraint on (student_id, subject_code, exam_type). 
            // We haven't set that constraint yet, so it will just insert new rows. 
            // Ideally we should add a UNIQUE INDEX for better data integrity.
        }

        res.json({ message: 'Bulk results processed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get My Results (Student)
exports.getMyResults = async (req, res) => {
    try {
        const student_id = req.user.id;
        const query = `
            SELECT r.*, s.name as subject_name 
            FROM results r
            LEFT JOIN subjects s ON r.subject_code = s.code
            WHERE r.student_id = ?
            ORDER BY r.published_at DESC
        `;
        const [rows] = await db.query(query, [student_id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Class Results (Faculty/Admin)
exports.getClassResults = async (req, res) => {
    try {
        const { department, year, section, subject_code, exam_type } = req.query;
        // This requires joining students table to filter by class
        let query = `
            SELECT r.*, s.name as student_name, s.reg_no, sub.name as subject_name
            FROM results r
            JOIN students s ON r.student_id = s.id
            LEFT JOIN subjects sub ON r.subject_code = sub.code
            WHERE s.department = ? AND s.year = ? AND s.section = ?
        `;
        const params = [department, year, section];

        if (subject_code) {
            query += ' AND r.subject_code = ?';
            params.push(subject_code);
        }
        if (exam_type) {
            query += ' AND r.exam_type = ?';
            params.push(exam_type);
        }

        query += ' ORDER BY s.reg_no ASC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
