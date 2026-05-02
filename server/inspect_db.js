import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function inspect() {
  try {
    console.log('--- Inspecting landing_features ---');
    const [features] = await pool.query('SELECT * FROM landing_features');
    for (const f of features) {
       console.log(`ID: ${f.id}, Title: ${f.title}, KorTitle: ${f.kor_title}, Desc: ${f.description}`);
    }

    console.log('--- Inspecting featured_items ---');
    const [products] = await pool.query('SELECT id, title, description, category FROM featured_items');
    for (const p of products) {
       console.log(`ID: ${p.id}, Title: ${p.title}, Desc: ${p.description}, Cat: ${p.category}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Inspect failed:', err);
    process.exit(1);
  }
}

inspect();
