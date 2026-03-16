import pool from './config/db.js';

async function listTables() {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        console.log('TABLES:', JSON.stringify(rows, null, 2));
        await pool.end();
    } catch (err) {
        console.error(err);
    }
}
listTables();
