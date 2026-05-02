import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function cleanup() {
  try {
    console.log('Checking landing_features for "폼클랜저"...');
    const [features] = await pool.query('SELECT id, title, kor_title FROM landing_features');
    
    for (const f of features) {
      const korTitle = typeof f.kor_title === 'string' ? JSON.parse(f.kor_title) : f.kor_title;
      const title = f.title;
      
      if (title?.includes('폼클랜저') || korTitle?.ko?.includes('폼클랜저') || korTitle?.en?.includes('폼클랜저')) {
        console.log(`Deleting landing feature ID ${f.id}: ${title || korTitle?.ko}`);
        await pool.query('DELETE FROM landing_features WHERE id = ?', [f.id]);
      }
    }

    console.log('Checking featured_items for "폼클랜저"...');
    // Just in case it's in products too, but the user specifically said "position shown in image"
    const [products] = await pool.query('SELECT id, title FROM featured_items');
    for (const p of products) {
      const title = typeof p.title === 'string' ? JSON.parse(p.title) : p.title;
      if (title?.ko?.includes('폼클랜저') || title?.en?.includes('폼클랜저')) {
         // The user didn't say delete the product entirely, just from the feature position.
         // But if it's in featured_items, maybe it shouldn't be "featured" on landing?
         // Actually, let's just focus on landing_features for now as the image matches that UI.
      }
    }

    console.log('Cleanup complete.');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();
