import pool from './config/db.js';
import fs from 'fs';

async function diagnose() {
    const log = (msg) => fs.appendFileSync('schema_debug.txt', msg + '\n');
    log('Starting schema diagnosis...');
    try {
        const [rows] = await pool.query('SHOW CREATE TABLE floor_categories');
        log('Query successful');
        log('--- DB Schema ---');
        log(rows[0]['Create Table']);
        log('Diagnosis complete');
    } catch (err) {
        log('Query failed: ' + err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

diagnose();
