const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'college_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.code);
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('Database "college_db" does not exist. Please create it.');
        }
    } else {
        console.log('Connected to MySQL database');
        connection.release();
    }
});

module.exports = pool.promise();
