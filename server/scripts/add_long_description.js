import pool from '../config/db.js';

async function migrate() {
  try {
    console.log('Starting migration: Checking and adding missing columns to featured_items...');
    
    // 1. Check long_description
    const [longDescCols] = await pool.query('SHOW COLUMNS FROM featured_items LIKE "long_description"');
    if (longDescCols.length === 0) {
      await pool.query('ALTER TABLE featured_items ADD COLUMN long_description JSON DEFAULT NULL');
      console.log('Column added: long_description');
    }

    // 2. Check page_type
    const [pageTypeCols] = await pool.query('SHOW COLUMNS FROM featured_items LIKE "page_type"');
    if (pageTypeCols.length === 0) {
      await pool.query('ALTER TABLE featured_items ADD COLUMN page_type VARCHAR(50) DEFAULT NULL');
      console.log('Column added: page_type');
    }

    // 3. Check parent_id
    const [parentIdCols] = await pool.query('SHOW COLUMNS FROM featured_items LIKE "parent_id"');
    if (parentIdCols.length === 0) {
      await pool.query('ALTER TABLE featured_items ADD COLUMN parent_id VARCHAR(100) DEFAULT NULL');
      console.log('Column added: parent_id');
    }

    // 4. Check theme_data
    const [themeDataCols] = await pool.query('SHOW COLUMNS FROM featured_items LIKE "theme_data"');
    if (themeDataCols.length === 0) {
      await pool.query('ALTER TABLE featured_items ADD COLUMN theme_data JSON DEFAULT NULL');
      console.log('Column added: theme_data');
    }

    console.log('Migration successful.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
