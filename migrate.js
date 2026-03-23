import pool from './server/config/db.js';

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Check if columns exist first
    const [rows] = await pool.query('DESCRIBE featured_items');
    const columnNames = rows.map(r => r.Field);
    
    if (!columnNames.includes('detail_media_url')) {
      console.log('Adding detail_media_url...');
      await pool.query('ALTER TABLE featured_items ADD COLUMN detail_media_url VARCHAR(512) AFTER long_description');
    } else {
      console.log('detail_media_url already exists.');
    }
    
    if (!columnNames.includes('detail_media_type')) {
      console.log('Adding detail_media_type...');
      await pool.query('ALTER TABLE featured_items ADD COLUMN detail_media_type VARCHAR(50) DEFAULT "image" AFTER detail_media_url');
    } else {
      console.log('detail_media_type already exists.');
    }
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

migrate();
