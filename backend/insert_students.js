const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'kavi2002', // Updated from .env
    database: 'college_db' // Assuming database name based on context
};

async function insertStudents() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const students = [
            ['Kavi', 'kavi@college.edu', '20042005', 'BCA001', 'BCA', 'III', 'A'],
            ['Abi', 'abi@college.edu', '10052005', 'BCA002', 'BCA', 'III', 'A'],
            ['Rahul Verma', 'rahul.bca@college.edu', '123456', 'BCA003', 'BCA', 'II', 'B'],
            ['Amit Patel', 'amit.bca@college.edu', '123456', 'BCA005', 'BCA', 'III', 'A'],
            ['Sneha Reddy', 'sneha.bca@college.edu', '123456', 'BCA006', 'BCA', 'III', 'A']
        ];

        const query = `
            INSERT INTO students (name, email, password, reg_no, department, year, section) 
            VALUES ?
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            password = VALUES(password),
            year = VALUES(year),
            section = VALUES(section),
            department = VALUES(department)
        `;

        await connection.query(query, [students]);
        console.log('Students inserted/updated successfully.');

    } catch (error) {
        console.error('Error inserting students:', error);
    } finally {
        if (connection) await connection.end();
    }
}

insertStudents();
