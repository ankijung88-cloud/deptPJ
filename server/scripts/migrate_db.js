import pool from '../config/db.js';

async function migrate() {
  try {
    console.log('Starting migration: Adding page_type column to featured_items...');
    
    // Check page_type
    const [pageTypeCols] = await pool.query('SHOW COLUMNS FROM featured_items LIKE "page_type"');
    if (pageTypeCols.length === 0) {
      await pool.query('ALTER TABLE featured_items ADD COLUMN page_type VARCHAR(50) DEFAULT NULL');
      console.log('Column added: page_type');
    }

    // Check parent_id
    const [parentIdCols] = await pool.query('SHOW COLUMNS FROM featured_items LIKE "parent_id"');
    if (parentIdCols.length === 0) {
      await pool.query('ALTER TABLE featured_items ADD COLUMN parent_id VARCHAR(100) DEFAULT NULL');
      console.log('Column added: parent_id');
    }

    // Check theme_data
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
