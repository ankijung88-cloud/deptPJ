import pool from '../config/db.js';

async function addCol() {
  try {
    console.log('Adding thumbnail_url column to featured_items...');
    await pool.query('ALTER TABLE featured_items ADD COLUMN IF NOT EXISTS thumbnail_url TEXT AFTER image_url');
    console.log('Column added successfully');
    process.exit(0);
  } catch (err) {
    // If IF NOT EXISTS is not supported, it might fail if already exists
    if (err.message.includes('Duplicate column name')) {
        console.log('Column already exists');
        process.exit(0);
    }
    console.error('Failed to add column:', err.message);
    process.exit(1);
  }
}

addCol();
