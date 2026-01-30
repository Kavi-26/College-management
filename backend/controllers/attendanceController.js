const db = require('../config/db');

// Mark Attendance (Bulk for a class/period)
exports.markAttendance = async (req, res) => {
    const { date, period, subject, department, year, section, studentStatuses } = req.body;
    // studentStatuses is an array: [{ student_id: 1, status: 'Present' }, ...]
    const facultyId = req.user.id; // From authMiddleware

    try {
        // validate date is today
        const today = new Date().toISOString().split('T')[0];
        if (date !== today) {
            return res.status(400).json({ message: 'You can only mark attendance for today.' });
        }

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

// Get Faculty Today's Stats (For Dashboard)
exports.getFacultyTodayStats = async (req, res) => {
    const facultyId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    try {
        // Count total present vs total marked by this faculty today
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total_marked,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as total_present 
            FROM attendance 
            WHERE faculty_id = ? AND date = ?
        `, [facultyId, today]);

        const stats = rows[0];
        const percentage = stats.total_marked === 0 ? 0 : ((stats.total_present / stats.total_marked) * 100).toFixed(1);

        res.json({
            todayPercentage: percentage,
            classesConducted: stats.total_marked > 0 ? 'Yes' : 'No' // Simplification
        });

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
    const { department, year, section, date, period } = req.query;

    try {
        const [students] = await db.query(`
            SELECT s.id, s.name, s.reg_no, a.status 
            FROM students s 
            LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ? AND a.period = ?
            WHERE s.department = ? AND s.year = ? AND s.section = ? 
            ORDER BY s.reg_no`,
            [date, period, department, year, section]
        );

        const isTaken = students.some(s => s.status != null);

        // If not taken, ensure status is null or default in frontend can handle it
        // We will send the list. If isTaken is true, frontend shows it as read-only.

        res.json({ students, isTaken });
    } catch (error) {
        console.error('Database Error in getStudentsForMarking:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Student Stats (For Student Dashboard)
exports.getStudentStats = async (req, res) => {
    const studentId = req.user.id;
    try {
        const [records] = await db.query(
            'SELECT subject, status, count(*) as count FROM attendance WHERE student_id = ? GROUP BY subject, status',
            [studentId]
        );

        let total = 0;
        let present = 0;
        const subjectStats = {};

        records.forEach(r => {
            if (!subjectStats[r.subject]) {
                subjectStats[r.subject] = { total: 0, present: 0, percentage: 0 };
            }

            subjectStats[r.subject].total += r.count;
            total += r.count;

            if (r.status === 'Present' || r.status === 'On Duty') {
                subjectStats[r.subject].present += r.count;
                present += r.count;
            }
        });

        // Calculate Percentages
        for (const subj in subjectStats) {
            const s = subjectStats[subj];
            s.percentage = s.total === 0 ? 0 : ((s.present / s.total) * 100).toFixed(1);
        }

        const overallPercentage = total === 0 ? 0 : ((present / total) * 100).toFixed(1);

        res.json({
            overall: overallPercentage,
            totalClasses: total,
            classesAttended: present,
            subjects: subjectStats
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
