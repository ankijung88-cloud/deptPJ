import pool from '../config/db.js';

async function init() {
  try {
    console.log('Starting Database Migration V2...');

    // Create notices table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title JSON NOT NULL,
        content JSON NOT NULL,
        category VARCHAR(50),
        date DATE,
        is_important BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "notices" created or already exists.');

    // Create faqs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question JSON NOT NULL,
        answer JSON NOT NULL,
        category VARCHAR(50),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "faqs" created or already exists.');

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

init();
