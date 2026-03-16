import pool from './config/db.js';
import fs from 'fs';

async function check() {
    const logFile = 'db_inspect.log';
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };
    
    fs.writeFileSync(logFile, '--- DB INSPECT START ---\n');
    
    try {
        const [tables] = await pool.query('SHOW TABLES');
        log('Tables in DB: ' + JSON.stringify(tables));
        
        const [rows] = await pool.query('SELECT * FROM floor_categories');
        log('Rows in floor_categories: ' + rows.length);
        
        rows.forEach((row, i) => {
            log(`ROW ${i}: id="${row.id}", floor="${row.floor}", bg_image=${!!row.bg_image}`);
            log(`  title: ${JSON.stringify(row.title)}`);
            log(`  subitems: ${JSON.stringify(row.subitems)}`);
        });
        
        log('--- DB INSPECT END ---');
        process.exit(0);
    } catch (e) {
        log('DB ERROR: ' + e.message);
        process.exit(1);
    }
}

check();
