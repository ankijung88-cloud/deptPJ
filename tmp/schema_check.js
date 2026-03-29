import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = 'c:/dev/DEPT-Pj2-main/server';

dotenv.config({ path: path.join(serverRoot, '.env') });

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '1234',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'dept_db',
};

async function checkSchema() {
  const pool = mysql.createPool(config);
  try {
    console.log('--- SCHEMA DIAGNOSTIC ---');
    const [columns] = await pool.query('SHOW COLUMNS FROM featured_items');
    console.log('Columns in featured_items:');
    columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
    
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM featured_items');
    console.log(`\nTotal rows in featured_items: ${rows[0].count}`);
    
    if (rows[0].count > 0) {
        const [sample] = await pool.query('SELECT * FROM featured_items LIMIT 5');
        console.log('\nSample data (first 5 rows):');
        sample.forEach(s => console.log(JSON.stringify(s)));
    }

    await pool.end();
  } catch (err) {
    console.error('Schema diagnostic failed:', err.message);
  }
}

checkSchema();
