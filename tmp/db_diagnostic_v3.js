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
  password: process.env.DB_PASSWORD || '1234',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'dept_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Connecting with config:', JSON.stringify({ ...config, password: '****' }));

async function diagnostic() {
  const pool = mysql.createPool(config);
  try {
    console.log('--- DATABASE DIAGNOSTIC v3 ---');
    const [rows] = await pool.query('SELECT id, category, subcategory, title, parent_id, agency_id FROM featured_items');
    console.log(`Total rows: ${rows.length}`);
    rows.forEach(row => {
      console.log(`ID: ${row.id} | Cat: ${row.category} | Sub: ${row.subcategory} | Title: ${row.title} | Parent: ${row.parent_id}`);
    });
    
    // Check for 'cinema' category specifically
    const [cinemaRows] = await pool.query('SELECT * FROM featured_items WHERE LOWER(category) LIKE LOWER(?)', ['%cinema%']);
    console.log(`\nSearch for 'cinema' returned: ${cinemaRows.length} rows`);
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Diagnostic failed:', err);
    process.exit(1);
  }
}

diagnostic();
