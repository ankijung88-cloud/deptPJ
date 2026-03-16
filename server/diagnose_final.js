import pool from './config/db.js';
import fs from 'fs';

async function diagnose() {
    try {
        const [rows] = await pool.query('SELECT * FROM floor_categories');
        const output = {
            count: rows.length,
            rows: rows.map(r => ({
                id: r.id,
                floor: r.floor,
                subitems_raw: r.subitems,
                subitems_type: typeof r.subitems
            }))
        };
        fs.writeFileSync('db_diagnostic.json', JSON.stringify(output, null, 2));
        console.log('Diagnostic written to db_diagnostic.json');
        await pool.end();
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('db_error.log', err.stack);
        process.exit(1);
    }
}

diagnose();
