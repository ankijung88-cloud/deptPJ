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
        data LONGBLOB NULL, -- Changed from NOT NULL to support SSD-only files
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('[DB] media_storage table is ready.');

    // NEW: Create users table if it doesn't exist
    console.log('[DB] Ensuring users table exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'AGENCY') NOT NULL DEFAULT 'AGENCY',
        agency_name VARCHAR(255) NULL,
        birth_date VARCHAR(10) NULL,
        phone_mobile VARCHAR(20) NULL,
        phone_company VARCHAR(20) NULL,
        address TEXT NULL,
        address_detail TEXT NULL,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    
    // Migration: Check if status column exists for existing table
    const [statusColumns] = await pool.query("SHOW COLUMNS FROM users LIKE 'status'");
    if (statusColumns.length === 0) {
      console.log('[DB] Missing status column in users. Running migration...');
      await pool.query("ALTER TABLE users ADD COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING' AFTER agency_name");
      await pool.query("UPDATE users SET status = 'APPROVED' WHERE role = 'ADMIN'");
      console.log('[DB] Migration successful: Added status to users.');
    }

    // New Migration: Add birth_date, phone_mobile, phone_company, address, address_detail
    const [birthColumns] = await pool.query("SHOW COLUMNS FROM users LIKE 'birth_date'");
    if (birthColumns.length === 0) {
      console.log('[DB] Missing extended info columns in users. Running migration...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN birth_date VARCHAR(10) NULL AFTER agency_name,
        ADD COLUMN phone_mobile VARCHAR(20) NULL AFTER birth_date,
        ADD COLUMN phone_company VARCHAR(20) NULL AFTER phone_mobile,
        ADD COLUMN address TEXT NULL AFTER phone_company,
        ADD COLUMN address_detail TEXT NULL AFTER address
      `);
      console.log('[DB] Migration successful: Added extended info columns to users.');
    }
    console.log('[DB] users table is ready.');

    // Seed default admin if no users exist
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('[DB] Seeding default admin user...');
      const ADMIN_USER = process.env.ADMIN_USER || 'admin';
      const ADMIN_PASS = process.env.ADMIN_PASS || 'admin1234';
      await pool.query(
        'INSERT INTO users (username, password, role, agency_name) VALUES (?, ?, ?, ?)',
        [ADMIN_USER, ADMIN_PASS, 'ADMIN', 'System Admin']
      );
    }

    // Check if agency_id exists in featured_items
    const [agencyColumns] = await pool.query("SHOW COLUMNS FROM featured_items LIKE 'agency_id'");
    if (agencyColumns.length === 0) {
      console.log('[DB] Missing agency_id column in featured_items. Running migration...');
      await pool.query("ALTER TABLE featured_items ADD COLUMN agency_id INT NULL AFTER id");
      
      // Assign existing products to the first admin
      const [adminRows] = await pool.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
      if (adminRows.length > 0) {
        await pool.query("UPDATE featured_items SET agency_id = ? WHERE agency_id IS NULL", [adminRows[0].id]);
      }
      console.log('[DB] Migration successful: Added agency_id to featured_items.');
    }

    // Ensure data column allows NULL
    const [mediaColumns] = await pool.query("SHOW COLUMNS FROM media_storage LIKE 'data'");
    if (mediaColumns.length > 0 && mediaColumns[0].Null === 'NO') {
      console.log('[DB] Updating media_storage.data to allow NULL...');
      await pool.query("ALTER TABLE media_storage MODIFY COLUMN data LONGBLOB NULL");
    }

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
