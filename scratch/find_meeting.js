import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function findMeeting() {
  try {
    console.log('--- Finding Meeting Products ---');
    const [products] = await pool.query('SELECT id, title, page_type FROM featured_items WHERE page_type = "meeting"');
    for (const p of products) {
       console.log(`ID: ${p.id}, Title: ${p.title}, Type: ${p.page_type}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Find failed:', err);
    process.exit(1);
  }
}

findMeeting();
