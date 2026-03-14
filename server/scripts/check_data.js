import pool from '../config/db.js';

async function checkData() {
  try {
    const tables = ['floor_categories', 'nav_items', 'notices', 'faqs', 'featured_items', 'products'];
    for (const table of tables) {
      console.log(`\n--- Table: ${table} ---`);
      try {
        const [rows] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`Count: ${rows[0].count}`);
        if (rows[0].count > 0) {
          const [data] = await pool.query(`SELECT * FROM ${table} LIMIT 1`);
          console.log('Sample data:', JSON.stringify(data[0], null, 2));
        }
      } catch (e) {
        console.log(`Table ${table} error: ${e.message}`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

checkData();
