const db = require('../config/db');

// Get Timetable for a Specific Class
exports.getTimetable = async (req, res) => {
    const { department, year, section } = req.query;

    try {
        const query = `
            SELECT t.*, f.name as faculty_name 
            FROM timetable t
            LEFT JOIN faculty f ON t.faculty_id = f.id
            WHERE t.department = ? AND t.year = ? AND t.section = ?
            ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), t.start_time
        `;
        const [rows] = await db.query(query, [department, year, section]);

        // Organize by Day
        const timetable = {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
        };

        rows.forEach(row => {
            if (timetable[row.day_of_week]) {
                timetable[row.day_of_week].push(row);
            }
        });

        res.json(timetable);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Timetable for Logged-in Faculty
exports.getMyTimetable = async (req, res) => {
    // req.user is set by authMiddleware
    const facultyId = req.user.id;

    try {
        // We need to find the actual faculty record ID from the user ID (which might be in 'faculty' table directly if auth sets it right)
        // Assuming req.user.id IS the faculty table id if role is faculty. 
        // Let's verify: In authController, we use `id` from the specific table. So yes.

        const query = `
            SELECT t.*, t.department, t.year, t.section
            FROM timetable t
            WHERE t.faculty_id = ?
            ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), t.start_time
        `;
        const [rows] = await db.query(query, [facultyId]);

        // Organize by Day
        const timetable = {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
        };

        rows.forEach(row => {
            if (timetable[row.day_of_week]) {
                // Add a formatted class name for display "BCA III A - Subject"
                row.display_title = `${row.department} ${row.year} ${row.section}`;
                timetable[row.day_of_week].push(row);
            }
        });

        res.json(timetable);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add/Update Timetable Entry (Admin Only)
exports.upsertTimetableEntry = async (req, res) => {
    const { day_of_week, start_time, end_time, subject, faculty_id, department, year, section, room_no, type, id } = req.body;

    try {
        if (id) {
            // Update existing
            await db.query(
                'UPDATE timetable SET day_of_week=?, start_time=?, end_time=?, subject=?, faculty_id=?, department=?, year=?, section=?, room_no=?, type=? WHERE id=?',
                [day_of_week, start_time, end_time, subject, faculty_id, department, year, section, room_no, type || 'Regular', id]
            );
            res.json({ message: 'Entry updated' });
        } else {
            // Insert new
            await db.query(
                'INSERT INTO timetable (day_of_week, start_time, end_time, subject, faculty_id, department, year, section, room_no, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [day_of_week, start_time, end_time, subject, faculty_id, department, year, section, room_no, type || 'Regular']
            );
            res.json({ message: 'Entry added' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Entry
exports.deleteTimetableEntry = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM timetable WHERE id = ?', [id]);
        res.json({ message: 'Entry deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
