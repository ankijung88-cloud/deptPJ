import pool from './server/config/db.js';

async function check() {
  const [rows] = await pool.query("SELECT id, metadata FROM featured_items WHERE id = 'dudba'");
  console.log(rows[0].metadata);
  process.exit();
}
check();
