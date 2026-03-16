import pool from './config/db.js';

async function diagnose() {
    console.log('Starting diagnostic...');
    const timeout = setTimeout(() => {
        console.error('Diagnostic timed out after 5s');
        process.exit(1);
    }, 5000);

    try {
        const [rows] = await pool.query('SHOW CREATE TABLE floor_categories');
        console.log('--- DB Schema for floor_categories ---');
        console.log(rows[0]['Create Table']);
        clearTimeout(timeout);
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Diagnostic error:', err);
        process.exit(1);
    }
}

diagnose();
