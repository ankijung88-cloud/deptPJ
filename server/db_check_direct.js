import pool from './config/db.js';

async function diagnose() {
    try {
        console.log('--- STARTING DB DIAGNOSIS ---');
        const [schema] = await pool.query('DESCRIBE floor_categories');
        console.log('SCHEMA:', JSON.stringify(schema, null, 2));
        
        const [rows] = await pool.query('SELECT * FROM floor_categories');
        console.log('ROWS COUNT:', rows.length);
        console.log('RECORDS:', JSON.stringify(rows, null, 2));
        
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('DIAGNOSIS ERROR:', err);
        process.exit(1);
    }
}

diagnose();
