import pool from '../config/db.js';

async function check() {
    try {
        const [rows] = await pool.query('SELECT id, filename, mimetype, LENGTH(data) as size FROM media_storage');
        console.log(`Found ${rows.length} rows in media_storage.`);
        rows.forEach(r => {
            console.log(`- ID: ${r.id}, Filename: ${r.filename}, Size: ${r.size}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

check();
