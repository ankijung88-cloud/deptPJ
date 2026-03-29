import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

async function checkDatabase() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'Bingsoo2019!!!',
    database: process.env.DB_NAME || 'dept_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('--- Database Status Report ---');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log('------------------------------');

    // 1. List Tables
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`Tables found: ${tableNames.join(', ')}`);

    // 2. Count Records in key tables
    for (const tableName of tableNames) {
      const [countResult] = await pool.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      console.log(`Table [${tableName}]: ${countResult[0].count} records`);
    }

    // 3. Check schema of featured_items specifically
    if (tableNames.includes('featured_items')) {
      console.log('\n--- featured_items Schema Scan ---');
      const [columns] = await pool.query('SHOW COLUMNS FROM featured_items');
      const columnNames = columns.map(c => c.Field);
      console.log(`Columns: ${columnNames.join(', ')}`);
      
      const [latestItems] = await pool.query('SELECT id, title, category, agency_id FROM featured_items ORDER BY created_at DESC LIMIT 3');
      console.log('\nLatest 3 items:');
      console.table(latestItems);
    }

    // 4. Check users
    if (tableNames.includes('users')) {
      console.log('\n--- users Summary ---');
      const [roles] = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
      console.table(roles);
    }

    // 5. Check orders
    if (tableNames.includes('orders')) {
      console.log('\n--- orders Summary ---');
      const [orderStatus] = await pool.query('SELECT status, COUNT(*) as count FROM orders GROUP BY status');
      console.table(orderStatus);
    }

  } catch (error) {
    console.error('Database Check Failed:', error.message);
  } finally {
    process.exit();
  }
}

checkDatabase();
