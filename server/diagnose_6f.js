import pool from './config/db.js';

async function diagnose() {
    console.log('--- Database Check ---');
    try {
        const [rows] = await pool.query('SELECT id, floor, title FROM floor_categories WHERE floor LIKE "%6%"');
        if (rows.length === 0) {
            console.log('No rows found matching floor "6"');
            const [all] = await pool.query('SELECT id, floor FROM floor_categories LIMIT 5');
            console.log('Sample IDs in DB:', JSON.stringify(all));
        } else {
            console.log('Matching rows found:', JSON.stringify(rows));
        }
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Diagnostic error:', err);
        process.exit(1);
    }
}

diagnose();
