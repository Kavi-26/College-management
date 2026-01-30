const db = require('../config/db');

// Mark Attendance (Bulk for a class/period)
exports.markAttendance = async (req, res) => {
    const { date, period, subject, department, year, section, studentStatuses } = req.body;
    // studentStatuses is an array: [{ student_id: 1, status: 'Present' }, ...]
    const facultyId = req.user.id; // From authMiddleware

    try {
        if (!studentStatuses || studentStatuses.length === 0) {
            return res.status(400).json({ message: 'No students provided' });
        }

        // We could optimize this with a single bulk INSERT ... ON DUPLICATE KEY UPDATE query
        // But for clarity/simplicity, we'll loop or use a promise key
        const queries = studentStatuses.map(s => {
            // Check if record exists for this student, date, period
            // If yes, update. If no, insert.
            const query = `
                INSERT INTO attendance (student_id, date, period, subject, status, faculty_id)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE status = ?, subject = ?, faculty_id = ?
            `;
            return db.query(query, [
                s.student_id, date, period, subject, s.status, facultyId,
                s.status, subject, facultyId
            ]);
        });

        await Promise.all(queries);
        res.json({ message: 'Attendance marked successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Daily Attendance Report (Grid: Student vs Period 1-5)
exports.getDailyReport = async (req, res) => {
    const { date, department, year, section } = req.query;

    try {
        // 1. Get all students in this class
        const [students] = await db.query(
            'SELECT id, name, reg_no FROM students WHERE department = ? AND year = ? AND section = ? ORDER BY reg_no',
            [department, year, section]
        );

        // 2. Get attendance records for this date and class
        const [records] = await db.query(`
            SELECT a.student_id, a.period, a.status, a.subject 
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE a.date = ? AND s.department = ? AND s.year = ? AND s.section = ?
        `, [date, department, year, section]);

        // 3. Transform into a grid format
        // Result: [{ id, name, reg_no, periods: { 1: 'Present', 2: 'Absent', ... } }, ...]
        const report = students.map(student => {
            const studentRecords = records.filter(r => r.student_id === student.id);
            const periods = {};
            // Initialize 1-5 as 'Not Marked' or null
            for (let i = 1; i <= 5; i++) periods[i] = '-';

            studentRecords.forEach(r => {
                periods[r.period] = r.status;
            });

            return {
                ...student,
                periods
            };
        });

        res.json(report);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Students for Marking (List to show in the form)
exports.getStudentsForMarking = async (req, res) => {
    const { department, year, section } = req.query;
    try {
        const [students] = await db.query(
            'SELECT id, name, reg_no FROM students WHERE department = ? AND year = ? AND section = ? ORDER BY reg_no',
            [department, year, section]
        );
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
