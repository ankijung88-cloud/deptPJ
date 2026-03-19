import pool from '../server/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function test() {
  const resultFile = path.join(__dirname, 'db_test_result.json');
  try {
    console.log('Testing DB connection...');
    const [rows] = await pool.query('SELECT 1 as result');
    const status = {
      connected: true,
      result: rows[0].result,
      env_check: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        db: process.env.DB_NAME
      }
    };
    fs.writeFileSync(resultFile, JSON.stringify(status, null, 2));
    console.log('Connection successful!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    const error = {
      connected: false,
      error: err.message,
      stack: err.stack,
      env_check: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        db: process.env.DB_NAME
      }
    };
    fs.writeFileSync(resultFile, JSON.stringify(error, null, 2));
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
}

test();
