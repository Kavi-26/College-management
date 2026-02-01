const db = require('../config/db');

// Get all departments
exports.getDepartments = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT code, name FROM departments ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all years
exports.getYears = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT code, name FROM years ORDER BY code');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all sections
exports.getSections = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT code, name FROM sections ORDER BY code');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all subjects (optionally filtered by department and year)
exports.getSubjects = async (req, res) => {
    try {
        const { department, year } = req.query;
        let query = 'SELECT * FROM subjects';
        const params = [];

        if (department || year) {
            query += ' WHERE';
            if (department) {
                query += ' department_code = ?';
                params.push(department);
            }
            if (year) {
                if (department) query += ' AND';
                query += ' year_code = ?';
                params.push(year);
            }
        }

        query += ' ORDER BY name';
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all rooms
exports.getRooms = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT room_no, building, capacity, type FROM rooms ORDER BY room_no');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
