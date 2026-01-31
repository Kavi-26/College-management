const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'college_db'
};

async function seedTimetable() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Get Faculty ID
        const [faculty] = await connection.query("SELECT id FROM faculty LIMIT 1");
        const facultyId = faculty[0].id;

        console.log('Clearing existing timetable...');
        await connection.query('DELETE FROM timetable');

        console.log('Seeding timetable for BCA III A (Mon-Sat, 9-4)...');

        // Schedule Logic:
        // 09:00 - 09:50 (Period 1)
        // 09:50 - 10:40 (Period 2)
        // 10:40 - 10:55 (Break 15m) -- GAP
        // 10:55 - 11:45 (Period 3)
        // 11:45 - 12:35 (Period 4)
        // 12:35 - 01:25 (Lunch 50m) -- GAP
        // 01:25 - 02:15 (Period 5)
        // 02:15 - 03:05 (Period 6)
        // 03:05 - 03:20 (Break 15m) -- GAP
        // 03:20 - 04:00 (Period 7) -- Shortened to fit 4pm

        const timeSlots = [
            ['09:00', '09:50'], // 1
            ['09:50', '10:40'], // 2
            ['10:55', '11:45'], // 3 (After 15m Break)
            ['11:45', '12:35'], // 4
            ['13:25', '14:15'], // 5 (After Lunch 12:35-1:25) -> Adjusted strictly to 1:25
            ['14:15', '15:05'], // 6 
            ['15:20', '16:00'], // 7 (After 15m Break 3:05-3:20)
        ];

        // Sample Subjects
        const subjectsPool = ['Web Programming', 'Database Management', 'Maths', 'English', 'Lab', 'Cloud Computing', 'Mini Project'];

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for (const day of days) {
            for (let i = 0; i < timeSlots.length; i++) {
                // Saturday half day? User said "Saturday Also" implying full or same structure. I'll do full for now.
                // Random Subject
                const subject = subjectsPool[Math.floor(Math.random() * subjectsPool.length)];
                const [start, end] = timeSlots[i];

                await connection.query(`
                    INSERT INTO timetable (day_of_week, start_time, end_time, subject, faculty_id, department, year, section, room_no)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [day, start, end, subject, facultyId, 'BCA', 'III', 'A', 'LH-101']);
            }
        }

        console.log('Seeding complete.');

    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        if (connection) await connection.end();
    }
}

seedTimetable();
