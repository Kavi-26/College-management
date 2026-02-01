const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'college_db'
};

async function updateSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        console.log("Checking if 'type' column exists in 'timetable'...");

        const [columns] = await connection.query("SHOW COLUMNS FROM timetable LIKE 'type'");

        if (columns.length === 0) {
            console.log("Adding 'type' column...");
            await connection.query("ALTER TABLE timetable ADD COLUMN type ENUM('Regular', 'Lab') DEFAULT 'Regular'");
            console.log("Column 'type' added successfully.");
        } else {
            console.log("Column 'type' already exists.");
        }

    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
