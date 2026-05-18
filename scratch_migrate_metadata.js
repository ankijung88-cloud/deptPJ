import pool from './server/config/db.js';

async function migrate() {
  try {
    console.log('[Migration] Adding metadata column to featured_items...');
    await pool.query("ALTER TABLE featured_items ADD COLUMN metadata JSON NULL");
    console.log('[Migration] Success: Added metadata column.');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN') {
      console.log('[Migration] metadata column already exists.');
      process.exit(0);
    } else {
      console.error('[Migration] Failed:', err.message);
      process.exit(1);
    }
  }
}

migrate();
