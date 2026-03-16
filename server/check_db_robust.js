import pool from './config/db.js';

async function check() {
    try {
        console.log('--- DB CHECK START ---');
        const [rows] = await pool.query('SELECT floor, id, bg_image, subitems FROM floor_categories');
        console.log('Rows found:', rows.length);
        rows.forEach((row, i) => {
            console.log(`ROW ${i}:`);
            console.log(`  id: "${row.id}"`);
            console.log(`  floor: "${row.floor}"`);
            console.log(`  bg_image: ${!!row.bg_image}`);
            console.log(`  subitems excerpt: ${JSON.stringify(row.subitems || []).substring(0, 100)}...`);
        });
        console.log('--- DB CHECK END ---');
        await pool.end();
        process.exit(0);
    } catch (e) {
        console.error('DB ERROR:', e);
        process.exit(1);
    }
}

check();
