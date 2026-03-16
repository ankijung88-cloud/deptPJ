import pool from './config/db.js';
import fs from 'fs';

async function diagnose() {
    const start = Date.now();
    try {
        console.log('Trying to connect to DB and query...');
        const [rows] = await pool.query('SELECT id, floor FROM floor_categories');
        fs.writeFileSync('db_check_v4.json', JSON.stringify({
            count: rows.length,
            rows: rows,
            elapsed: Date.now() - start
        }, null, 2));
        console.log('Query successful, found', rows.length, 'rows');
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('db_check_v4_error.log', err.stack);
        console.error('Query failed:', err.message);
        process.exit(1);
    }
}

// Global timeout to prevent hanging forever
setTimeout(() => {
    fs.appendFileSync('db_check_v4_error.log', '\nGlobal timeout reached after 15s');
    process.exit(1);
}, 15000);

diagnose();
