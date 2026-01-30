const db = require('./config/db');

async function check() {
    try {
        const email = 'kavi@college.edu';
        console.log(`Checking for student with email: '${email}'`);

        const [rows] = await db.query('SELECT * FROM students WHERE email = ?', [email]);

        if (rows.length === 0) {
            console.log('User NOT FOUND in "students" table');
        } else {
            console.log('User FOUND:', rows[0].email);
            console.log(`Stored Password: '${rows[0].password}'`);
            console.log(`Password Length: ${rows[0].password.length}`);
        }
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit();
}

check();
