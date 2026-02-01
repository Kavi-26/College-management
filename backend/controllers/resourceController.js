const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Upload Resource (Faculty)
exports.uploadResource = async (req, res) => {
    try {
        const { title, subject_code, department, year } = req.body;
        const uploaded_by = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file_path = `/uploads/${req.file.filename}`;
        const file_type = path.extname(req.file.originalname).substring(1); // e.g., pdf

        const query = `
            INSERT INTO resources (title, subject_code, department, year, file_path, file_type, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [title, subject_code, department, year, file_path, file_type, uploaded_by]);

        // Notify Students? (Optional, maybe later)

        res.status(201).json({
            message: 'Resource uploaded successfully',
            resource: { id: result.insertId, title, file_path }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Resources (Filtered)
exports.getResources = async (req, res) => {
    try {
        const { department, year, subject_code } = req.query;
        // Basic filtering
        let query = `
            SELECT r.*, u.name as faculty_name 
            FROM resources r
            JOIN users u ON r.uploaded_by = u.id
            WHERE 1=1
        `;
        const params = [];

        if (department) {
            query += ' AND r.department = ?';
            params.push(department);
        }
        if (year) {
            query += ' AND r.year = ?';
            params.push(year);
        }
        if (subject_code) {
            query += ' AND r.subject_code = ?';
            params.push(subject_code);
        }

        query += ' ORDER BY r.created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Resource (Faculty)
exports.deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if resource exists and belongs to user (unless admin)
        const [rows] = await db.query('SELECT * FROM resources WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Resource not found' });

        const resource = rows[0];

        if (userRole !== 'admin' && resource.uploaded_by !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete file from filesystem
        const absolutePath = path.join(__dirname, '..', resource.file_path);
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }

        await db.query('DELETE FROM resources WHERE id = ?', [id]);
        res.json({ message: 'Resource deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
