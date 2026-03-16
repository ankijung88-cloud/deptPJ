import pool from './config/db.js';
import fs from 'fs';

async function checkSchema() {
    try {
        console.log('--- DB SCHEMA CHECK ---');
        const [columns] = await pool.query('DESCRIBE floor_categories');
        const schema = columns.map(col => ({
            field: col.Field,
            type: col.Type,
            null: col.Null,
            key: col.Key
        }));
        console.log('Schema:', JSON.stringify(schema, null, 2));
        
        const [rows] = await pool.query('SELECT id, floor FROM floor_categories');
        console.log('Current Records:', JSON.stringify(rows, null, 2));
        
        await pool.end();
    } catch (err) {
        console.error('SCHEMA CHECK ERROR:', err);
    }
}

checkSchema();
