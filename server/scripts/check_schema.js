import pool from '../config/db.js';

async function checkSchema() {
  try {
    const [rows] = await pool.query('DESCRIBE featured_items');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Failed to describe table:', err.message);
    process.exit(1);
  }
}

checkSchema();
