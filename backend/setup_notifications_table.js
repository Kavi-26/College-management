const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'college_db',
    multipleStatements: true
};

async function setupNotificationsTable() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const sql = fs.readFileSync('./setup_notifications_table.sql', 'utf8');
        await connection.query(sql);

        console.log('✅ Notifications table created successfully!');
    } catch (err) {
        console.error('❌ Error setting up notifications table:', err);
    } finally {
        if (connection) await connection.end();
    }
}

setupNotificationsTable();
