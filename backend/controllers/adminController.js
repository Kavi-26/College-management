const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Get System Stats
exports.getSystemStats = async (req, res) => {
    try {
        const [students] = await db.query('SELECT COUNT(*) as count FROM students');
        const [faculty] = await db.query('SELECT COUNT(*) as count FROM faculty');
        const [events] = await db.query('SELECT COUNT(*) as count FROM events');
        const [notices] = await db.query('SELECT COUNT(*) as count FROM notices');
        const [resources] = await db.query('SELECT COUNT(*) as count FROM resources');

        res.json({
            students: students[0].count,
            faculty: faculty[0].count,
            events: events[0].count,
            notices: notices[0].count,
            resources: resources[0].count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Trigger Database Backup (Logical JSON Dump)
exports.triggerBackup = async (req, res) => {
    try {
        // Fetch data from key tables
        const [students] = await db.query('SELECT * FROM students');
        const [faculty] = await db.query('SELECT * FROM faculty');
        const [attendance] = await db.query('SELECT * FROM attendance');
        const [results] = await db.query('SELECT * FROM results');

        const backupData = {
            timestamp: new Date(),
            data: { students, faculty, attendance, results }
        };

        const backupDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        const fileName = `backup-${Date.now()}.json`;
        const filePath = path.join(backupDir, fileName);

        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

        res.json({ message: 'Backup created successfully', fileName });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add Subject
exports.addSubject = async (req, res) => {
    try {
        const { code, name, type, department_code, year_code } = req.body;

        await db.query(`
            INSERT INTO subjects (code, name, type, department_code, year_code)
            VALUES (?, ?, ?, ?, ?)
        `, [code, name, type, department_code, year_code]);

        res.status(201).json({ message: 'Subject added successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Subject code already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Subject
exports.deleteSubject = async (req, res) => {
    try {
        const { code } = req.params;
        await db.query('DELETE FROM subjects WHERE code = ?', [code]);
        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Subjects (for management list)
exports.getAllSubjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subjects ORDER BY department_code, year_code, name');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
