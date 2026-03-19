import pool from './db.js';

/**
 * Self-healing Database Migration
 * Checks if side_image_url and back_image_url columns exist in featured_items table.
 * If not, adds them.
 */
async function initDB() {
  try {
    console.log('[DB] Checking schema...');
    
    // Check if side_image_url exists
    const [sideColumns] = await pool.query("SHOW COLUMNS FROM featured_items LIKE 'side_image_url'");
    
    if (sideColumns.length === 0) {
      console.log('[DB] Missing multi-angle columns detected. Running migration...');
      
      // Add columns if they don't exist
      await pool.query(`
        ALTER TABLE featured_items 
        ADD COLUMN side_image_url TEXT AFTER thumbnail_url,
        ADD COLUMN back_image_url TEXT AFTER side_image_url
      `);
      
      console.log('[DB] Migration successful: Added side_image_url and back_image_url.');
    }

    // Check if selected_templates exists
    const [templateColumns] = await pool.query("SHOW COLUMNS FROM featured_items LIKE 'selected_templates'");
    if (templateColumns.length === 0) {
      console.log('[DB] Missing selected_templates column detected. Running migration...');
      await pool.query("ALTER TABLE featured_items ADD COLUMN selected_templates JSON DEFAULT NULL");
      console.log('[DB] Migration successful: Added selected_templates.');
    } else {
      console.log('[DB] featured_items schema is up to date.');
    }

    // NEW: Create media_storage table if it doesn't exist
    console.log('[DB] Ensuring media_storage table exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_storage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        data LONGBLOB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('[DB] media_storage table is ready.');

  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN') {
      console.log('[DB] Columns already exist.');
    } else {
      console.error('[DB] Schema check failed:', error.message);
    }
  }
}

// Execute initialization
initDB();

export default initDB;
