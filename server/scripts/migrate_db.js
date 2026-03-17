import pool from '../config/db.js';

async function migrate() {
  try {
    console.log('Starting migration: Adding page_type column to featured_items...');
    
    // Check if column already exists
    const [columns] = await pool.query('SHOW COLUMNS FROM featured_items LIKE "page_type"');
    
    if (columns.length === 0) {
      await pool.query('ALTER TABLE featured_items ADD COLUMN page_type VARCHAR(50) DEFAULT NULL');
      console.log('Migration successful: page_type column added.');
    } else {
      console.log('Migration skipped: page_type column already exists.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
