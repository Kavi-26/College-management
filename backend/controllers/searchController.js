const db = require('../config/db');

exports.globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const searchTerm = `%${q}%`;
        const userRole = req.user.role;
        const results = {
            students: [],
            notices: [],
            events: [],
            resources: []
        };

        // Parallel queries for better performance
        const queries = [];

        // 1. Search Notices (All users)
        queries.push(
            db.query('SELECT id, title, content as description, posted_by, "notice" as type FROM notices WHERE title LIKE ? OR content LIKE ? LIMIT 5', [searchTerm, searchTerm])
                .then(([rows]) => results.notices = rows)
        );

        // 2. Search Events (All users)
        queries.push(
            db.query('SELECT id, title, description, date, location, "event" as type FROM events WHERE title LIKE ? OR description LIKE ? LIMIT 5', [searchTerm, searchTerm])
                .then(([rows]) => results.events = rows)
        );

        // 3. Search Resources (All users)
        queries.push(
            db.query('SELECT id, title, subject_code, file_path, "resource" as type FROM resources WHERE title LIKE ? OR subject_code LIKE ? LIMIT 5', [searchTerm, searchTerm])
                .then(([rows]) => results.resources = rows)
        );

        // 4. Search Students (Faculty/Admin only)
        if (['faculty', 'admin'].includes(userRole)) {
            queries.push(
                db.query('SELECT id, name, reg_no, department, year, "student" as type FROM students WHERE name LIKE ? OR reg_no LIKE ? LIMIT 5', [searchTerm, searchTerm])
                    .then(([rows]) => results.students = rows)
            );
        }

        await Promise.all(queries);

        // Flatten results for easy frontend consumption, or keep grouped? 
        // Let's keep them grouped in the response structure for better UI organization, 
        // or flatten if we want a single list.
        // Let's flatten for a simple "Global Search" list, but with type info.

        const flatResults = [
            ...results.students.map(i => ({ ...i, title: i.name, subtitle: i.reg_no })), // Standardize for UI
            ...results.notices.map(i => ({ ...i, subtitle: 'Notice' })),
            ...results.events.map(i => ({ ...i, subtitle: new Date(i.date).toLocaleDateString() })),
            ...results.resources.map(i => ({ ...i, subtitle: i.subject_code }))
        ];

        res.json(flatResults);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
