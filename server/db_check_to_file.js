import pool from './config/db.js';
import fs from 'fs';

async function diagnose() {
    try {
        const [schema] = await pool.query('DESCRIBE floor_categories');
        const [rows] = await pool.query('SELECT * FROM floor_categories');
        
        const results = {
            schema: schema,
            rows_count: rows.length,
            rows: rows
        };
        
        fs.writeFileSync('db_check_results.json', JSON.stringify(results, null, 2));
        await pool.end();
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('db_error.log', err.stack);
        process.exit(1);
    }
}

diagnose();
