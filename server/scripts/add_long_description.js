import pool from '../config/db.js';

async function migrate() {
  try {
    console.log('Starting migration: Adding long_description column to featured_items...');
    
    // Check long_description
    const [cols] = await pool.query('SHOW COLUMNS FROM featured_items LIKE "long_description"');
    if (cols.length === 0) {
      await pool.query('ALTER TABLE featured_items ADD COLUMN long_description JSON DEFAULT NULL');
      console.log('Column added: long_description');
    } else {
      console.log('Column already exists: long_description');
    }

    console.log('Migration successful.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
