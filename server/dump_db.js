import pool from './config/db.js';
import fs from 'fs';

async function dump() {
    try {
        console.log('Querying floor_categories...');
        const [rows] = await pool.query('SELECT * FROM floor_categories');
        console.log(`Found ${rows.length} rows.`);
        fs.writeFileSync('db_dump.json', JSON.stringify(rows, null, 2));
        console.log('Dump saved to db_dump.json');
        
        const [desc] = await pool.query('DESCRIBE floor_categories');
        fs.writeFileSync('db_schema.json', JSON.stringify(desc, null, 2));
        console.log('Schema saved to db_schema.json');
        
        process.exit(0);
    } catch (e) {
        console.error('DATABASE ERROR:', e);
        process.exit(1);
    }
}

dump();
