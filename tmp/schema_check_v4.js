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
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASS || 'Bingsoo2019!!!',
  port: 3306,
  database: process.env.DB_NAME || 'dept_db',
};

async function checkSchema() {
  const pool = mysql.createPool(config);
  try {
    console.log('--- SCHEMA DIAGNOSTIC V4 ---');
    const [columns] = await pool.query('SHOW COLUMNS FROM featured_items');
    console.log('Columns:');
    columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
    
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM featured_items');
    console.log(`\nTotal rows: ${rows[0].count}`);
    
    if (rows[0].count > 0) {
        const [samples] = await pool.query('SELECT id, category, title FROM featured_items LIMIT 5');
        samples.forEach(s => console.log(`ID: ${s.id} | Cat: ${s.category} | Title: ${s.title?.substring(0, 30)}...`));
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Schema diagnostic failed:', err.message);
    process.exit(1);
  }
}

checkSchema();
