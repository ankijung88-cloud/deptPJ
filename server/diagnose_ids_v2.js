import pool from './config/db.js';
import fs from 'fs';

async function diagnose() {
    try {
        const [rows] = await pool.query('SELECT * FROM floor_categories');
        const summary = rows.map(r => ({ id: r.id, floor: r.floor }));
        fs.writeFileSync('db_ids.txt', JSON.stringify(summary, null, 2));
        console.log('ID summary written to db_ids.txt');
        await pool.end();
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('db_ids_err.txt', err.stack);
        process.exit(1);
    }
}

diagnose();
