import pool from './server/config/db.js';

async function diagnose() {
    try {
        console.log('--- DB Diagnosis Start ---');
        const [rows] = await pool.query('SELECT * FROM floor_categories WHERE floor IN ("4F", "6F") OR id IN ("floor-4", "floor-6", "floor-gather-mall")');
        console.log(JSON.stringify(rows, null, 2));
        console.log('--- DB Diagnosis End ---');
        process.exit(0);
    } catch (error) {
        console.error('Diagnosis failed:', error);
        process.exit(1);
    }
}

diagnose();
