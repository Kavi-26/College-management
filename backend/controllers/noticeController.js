const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Get Notices (with Filters)
exports.getNotices = async (req, res) => {
    try {
        const { type, audience } = req.query;
        let query = 'SELECT * FROM notices WHERE 1=1';
        const params = [];

        if (type && type !== 'All') {
            query += ' AND type = ?';
            params.push(type);
        }

        // Audience logic: 
        // If user is Student, show 'All' and 'Student'.
        // If user is Faculty, show 'All' and 'Faculty'.
        // If Admin, show everything.
        // req.user is populated by middleware

        const userRole = req.user.role;

        if (userRole === 'student') {
            query += " AND (target_audience = 'All' OR target_audience = 'Student')";
        } else if (userRole === 'faculty') {
            query += " AND (target_audience = 'All' OR target_audience = 'Faculty')";
        }
        // Admin sees all, so no extra filter needed if role is admin

        query += ' ORDER BY is_pinned DESC, created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Notice
exports.createNotice = async (req, res) => {
    try {
        const { title, content, type, target_audience } = req.body;
        const attachment_path = req.file ? `/uploads/${req.file.filename}` : null;

        // User details from token
        const posted_by_id = req.user.id;
        const posted_by_role = req.user.role;
        const posted_by_name = req.user.name; // This assumes auth middleware adds name, if not we need to fetch it or rely on frontend sending it (less secure) or fetch it here.
        // Middleware usually just adds {id, role} to req.user. Let's fetch the name to be safe and accurate.

        let authorName = 'Admin';
        if (posted_by_role === 'faculty') {
            const [rows] = await db.query('SELECT name FROM faculty WHERE id = ?', [posted_by_id]);
            if (rows.length > 0) authorName = rows[0].name;
        } else if (posted_by_role === 'admin') {
            const [rows] = await db.query('SELECT name FROM admin WHERE id = ?', [posted_by_id]);
            if (rows.length > 0) authorName = rows[0].name;
        }

        const query = `
            INSERT INTO notices (title, content, type, target_audience, attachment_path, posted_by_id, posted_by_name, posted_by_role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [title, content, type, target_audience, attachment_path, posted_by_id, authorName, posted_by_role]);

        res.status(201).json({ message: 'Notice posted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Notice
exports.deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if notice exists
        const [notices] = await db.query('SELECT * FROM notices WHERE id = ?', [id]);
        if (notices.length === 0) return res.status(404).json({ message: 'Notice not found' });

        const notice = notices[0];

        // Authorization: Admin can delete any. Faculty can only delete their own.
        if (userRole !== 'admin') {
            if (notice.posted_by_id !== userId || notice.posted_by_role !== userRole) {
                return res.status(403).json({ message: 'Not authorized to delete this notice' });
            }
        }

        // Delete file if exists
        if (notice.attachment_path) {
            const filePath = path.join(__dirname, '..', notice.attachment_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM notices WHERE id = ?', [id]);
        res.json({ message: 'Notice deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
