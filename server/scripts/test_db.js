import pool from '../config/db.js';

async function test() {
    try {
        console.log('Testing DB connection...');
        const [rows] = await pool.query('SELECT 1 as result');
        console.log('Connection successful:', rows);
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}

test();
