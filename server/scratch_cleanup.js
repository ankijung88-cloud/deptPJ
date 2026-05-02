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

async function cleanup() {
  try {
    console.log('Checking landing_features for "폼클랜저"...');
    const [features] = await pool.query('SELECT id, title, kor_title FROM landing_features');
    
    let deletedCount = 0;
    for (const f of features) {
      const korTitle = typeof f.kor_title === 'string' ? JSON.parse(f.kor_title) : f.kor_title;
      const title = f.title;
      
      const isMatch = (title && title.includes('폼클랜저')) || 
                      (korTitle?.ko && korTitle.ko.includes('폼클랜저')) || 
                      (korTitle?.en && korTitle.en.includes('폼클랜저'));

      if (isMatch) {
        console.log(`Deleting landing feature ID ${f.id}: ${title || korTitle?.ko}`);
        await pool.query('DELETE FROM landing_features WHERE id = ?', [f.id]);
        deletedCount++;
      }
    }

    console.log(`Cleanup complete. Deleted ${deletedCount} features.`);
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();
