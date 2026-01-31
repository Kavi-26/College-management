const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'college_db'
};

async function seedAttendance() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Get Student 'Kavi'
        const [students] = await connection.query("SELECT id FROM students WHERE email = 'kavi@college.edu'");
        if (students.length === 0) {
            console.log('Student Kavi not found. Please ensure users are seeded.');
            return;
        }
        const studentId = students[0].id;

        // Get a Faculty ID
        const [faculty] = await connection.query("SELECT id FROM faculty LIMIT 1");
        const facultyId = faculty[0].id;

        console.log(`Seeding attendance for Student ID: ${studentId}, Faculty ID: ${facultyId}`);

        const subjects = ['Web Programming', 'Database Management', 'Maths', 'English', 'Lab'];
        const dates = [];

        // Generate last 5 days
        for (let i = 0; i < 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }

        for (const date of dates) {
            for (let period = 1; period <= 5; period++) {
                // Random status: 80% Present
                const status = Math.random() > 0.2 ? 'Present' : 'Absent';
                const subject = subjects[period - 1] || 'General';

                await connection.query(`
                    INSERT INTO attendance (student_id, date, period, subject, status, faculty_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [studentId, date, period, subject, status, facultyId]);
            }
        }

        console.log('Seeding complete. 25 Records added.');

    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        if (connection) await connection.end();
    }
}

seedAttendance();
