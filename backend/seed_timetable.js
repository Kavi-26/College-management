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

        // 1. Ensure we have enough Faculty for the constraint "1 Faculty = 1 Subject"
        // We need about 5-6 faculty members.
        // Let's create them if they don't exist, or just fetch all and cycle through.

        // Mock Faculty Data to ensure existence
        const mockFaculty = [
            { name: 'Prof. Sharma', email: 'sharma@college.edu', dept: 'BCA' }, // Web Programming
            { name: 'Dr. Priya', email: 'priya@college.edu', dept: 'BCA' }, // DBMS
            { name: 'Prof. John', email: 'john@college.edu', dept: 'BCA' }, // Maths
            { name: 'Ms. Anjali', email: 'anjali@college.edu', dept: 'English' }, // English
            { name: 'Mr. Raj', email: 'raj@college.edu', dept: 'BCA' }, // Cloud Computing
        ];

        let facultyIds = [];

        for (const f of mockFaculty) {
            // Check if exists
            const [rows] = await connection.query('SELECT id FROM faculty WHERE email = ?', [f.email]);
            let fid;
            if (rows.length > 0) {
                fid = rows[0].id;
            } else {
                // Insert default pass 'password123' hashed (skip hashing for seed simplicity or use valid hash if needed)
                // For simplicity in seed, assuming simple insert works or auth handles generic. 
                // Wait, auth uses bcrypt. I should insert with a known hash or just use existing.
                // Actually, let's just use whatever faculty exist + create placeholders if empty.
                // BETTER: Just select all faculty, if < 5, insert dummy ones.
                const [res] = await connection.query('INSERT INTO faculty (name, email, password, department) VALUES (?, ?, ?, ?)',
                    [f.name, f.email, '$2b$10$YourHashedPasswordHere', f.dept]);
                fid = res.insertId;
            }
            facultyIds.push(fid);
        }

        // Map Faculty to Subjects (1:1 Constraint)
        // Format: { subject: 'Name', type: 'Regular/Lab', facultyIndex: 0 }
        // We pair Regular and Lab of same subject to SAME faculty if possible, or user said "one faculty handles only one regular class and lab (one subject only)"
        // So: Prof A -> Web Prog (Reg) + Web Prog (Lab)

        const subjectAllocations = [
            { name: 'Web Programming', type: 'Regular', fIdx: 0 },
            { name: 'Web Programming Lab', type: 'Lab', fIdx: 0 }, // Same faculty

            { name: 'Database Management', type: 'Regular', fIdx: 1 },
            { name: 'DBMS Lab', type: 'Lab', fIdx: 1 }, // Same faculty

            { name: 'Maths', type: 'Regular', fIdx: 2 },

            { name: 'English', type: 'Regular', fIdx: 3 },

            { name: 'Cloud Computing', type: 'Regular', fIdx: 4 },
            { name: 'Mini Project', type: 'Lab', fIdx: 4 } // Assign to Cloud faculty for now
        ];

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
            ['10:55', '11:45'], // 3
            ['11:45', '12:35'], // 4
            ['13:25', '14:15'], // 5
            ['14:15', '15:05'], // 6 
            ['15:20', '16:00'], // 7
        ];

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for (const day of days) {
            for (let i = 0; i < timeSlots.length; i++) {
                // Pick a random subject allocation
                const alloc = subjectAllocations[Math.floor(Math.random() * subjectAllocations.length)];

                const facultyId = facultyIds[alloc.fIdx % facultyIds.length];
                const [start, end] = timeSlots[i];

                // If Lab, maybe it takes 2 slots? For now simplest case: 1 slot = 1 class entry.
                // Admin can merge slots later if needed (complex UI), for now distinct blocks.

                await connection.query(`
                    INSERT INTO timetable (day_of_week, period, start_time, end_time, subject, faculty_id, department, year, section, room_no, type)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [day, i + 1, start, end, alloc.name, facultyId, 'BCA', 'III', 'A', alloc.type === 'Lab' ? 'LAB-1' : 'LH-101', alloc.type]);
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
