import pool from '../config/db.js';

async function verify() {
  try {
    const tables = ['floor_categories', 'nav_items', 'notices', 'faqs', 'featured_items'];
    for (const table of tables) {
      console.log(`\nSchema for table: ${table}`);
      try {
        const [rows] = await pool.query(`DESCRIBE ${table}`);
        console.table(rows);
      } catch (e) {
        console.log(`Table ${table} does not exist or error: ${e.message}`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
}

verify();
