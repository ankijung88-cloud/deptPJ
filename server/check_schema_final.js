import pool from './config/db.js';
import fs from 'fs';

async function check() {
    try {
        const [rows] = await pool.query('DESCRIBE floor_categories');
        fs.writeFileSync('schema_final.json', JSON.stringify(rows, null, 2));
        console.log('Schema saved.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
