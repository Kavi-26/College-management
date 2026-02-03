const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ... existing code ...


// Helper: Get table name based on role
const getTable = (role) => {
    switch (role) {
        case 'student': return 'students';
        case 'faculty': return 'faculty';
        case 'admin': return 'admin';
        default: return null;
    }
};

// Register User (Admin/Faculty/Student)
// Basic Faculty List for Admin Dropdown - Mock or Simple Select
exports.getFacultyList = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, department FROM faculty ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.register = async (req, res) => {
    const { name, email, password, role, reg_no, department, year, section, designation } = req.body;

    const table = getTable(role);
    if (!table) return res.status(400).json({ message: 'Invalid role' });

    try {
        // Check if user exists
        const [existingUser] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password - DISABLED AS PER USER REQUEST
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);
        const hashedPassword = password; // Store plain text

        // Insert based on role
        let query = '';
        let params = [];

        if (role === 'student') {
            query = `INSERT INTO students (name, email, password, reg_no, department, year, section) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            params = [name, email, hashedPassword, reg_no, department, year, section];
        } else if (role === 'faculty') {
            query = `INSERT INTO faculty (name, email, password, department, designation) VALUES (?, ?, ?, ?, ?)`;
            params = [name, email, hashedPassword, department, designation];
        } else if (role === 'admin') {
            query = `INSERT INTO admin (name, email, password) VALUES (?, ?, ?)`;
            params = [name, email, hashedPassword];
        }

        const [result] = await db.query(query, params);

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// Login User
exports.login = async (req, res) => {
    const { email, password, role } = req.body;
    console.log('Login Attempt:', { email, password, role });


    const table = getTable(role);
    if (!table) return res.status(400).json({ message: 'Invalid role' });

    try {
        // Check user in specific table
        const [users] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
        if (users.length === 0) {
            console.log('User not found in table:', table);
            return res.status(400).json({ message: `User not found in ${role} table` });
        }

        const user = users[0];

        // Check password (Plain Text) with robust comparison
        console.log(`Comparing input '${password}' with stored '${user.password}'`);
        const isMatch = (String(password).trim() === String(user.password).trim());

        if (!isMatch) {
            console.log(`Password mismatch: Input length ${password.length}, Stored length ${user.password.length}`);
            return res.status(400).json({ message: 'Password mismatch' });
        }

        // Generate JWT
        const payload = {
            user: {
                id: user.id,
                role: role // Injected from request since tables don't have 'role' col
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                // Return consistent user object structure
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        role: role,
                        reg_no: user.reg_no,
                        department: user.department
                    }
                });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Current User Profile
exports.getUser = async (req, res) => {
    try {
        const role = req.user.role;
        const table = getTable(role);

        if (!table) return res.status(400).json({ message: 'Invalid role in token' });

        const [users] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [req.user.id]);

        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        // Remove password from response
        const user = users[0];
        delete user.password;
        user.role = role; // Append role to response

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const role = req.user.role;
    const table = getTable(role);

    try {
        const [users] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [req.user.id]);
        const user = users[0];

        // const isMatch = await bcrypt.compare(currentPassword, user.password);
        const isMatch = (currentPassword === user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(newPassword, salt);
        const hashedPassword = newPassword;

        await db.query(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashedPassword, req.user.id]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
