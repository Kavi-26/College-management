const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'college_db'
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const addColumn = async (colName, colDef) => {
            const [rows] = await connection.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'results' AND COLUMN_NAME = ?
            `, [process.env.DB_NAME || 'college_db', colName]);

            if (rows.length === 0) {
                await connection.query(`ALTER TABLE results ADD COLUMN ${colName} ${colDef}`);
                console.log(`+ Added column ${colName}`);
            } else {
                console.log(`- Column ${colName} already exists`);
            }
        };

        await addColumn('cat_marks', 'DECIMAL(5, 2) DEFAULT 0.00');
        await addColumn('assessment_marks', 'DECIMAL(5, 2) DEFAULT 0.00');
        await addColumn('semester_marks', 'DECIMAL(5, 2) DEFAULT 0.00');
        await addColumn('is_student_added', 'BOOLEAN DEFAULT FALSE');

        console.log('✅ Database migration successful.');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
