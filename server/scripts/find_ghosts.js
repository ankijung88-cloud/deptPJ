import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const TEMPLATE_CATEGORIES = ['cinema', 'museum', 'store', 'ticket'];

async function cleanup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    // Find all items
    const [rows] = await connection.query('SELECT id, title, category, subcategory FROM featured_items');
    
    // Floors are usually floor-1, floor-2, etc.
    const ghostItems = rows.filter(item => {
      const isFloor = item.category && item.category.startsWith('floor-');
      const isTemplate = TEMPLATE_CATEGORIES.includes(item.category);
      
      // A ghost is something that has no category, or a category that isn't a floor or standard template,
      // OR specifically what the user mentioned: "only data exists but doesn't belong to any item".
      // Let's look for items with no category or subcategory first.
      return !item.category || (!isFloor && !isTemplate);
    });

    console.log('--- POTENTIAL GHOST ITEMS ---');
    ghostItems.forEach(item => {
      console.log(`ID: ${item.id}, Title: ${item.title}, Cat: ${item.category}, Sub: ${item.subcategory}`);
    });
    console.log('-----------------------------');

  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

cleanup();
