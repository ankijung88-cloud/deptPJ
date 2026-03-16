import pool from './config/db.js';
import fs from 'fs';

async function check() {
    const log = (msg) => fs.appendFileSync('check_6f.log', msg + '\n');
    fs.writeFileSync('check_6f.log', 'Starting check...\n');
    try {
        const [rows] = await pool.query('SELECT floor, subitems FROM floor_categories WHERE floor = "6F"');
        if (rows.length === 0) {
            log('No data found for floor 6F');
        } else {
            log('Floor: ' + rows[0].floor);
            log('Subitems Raw: ' + rows[0].subitems);
        }
    } catch (err) {
        log('Error: ' + err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

check();
