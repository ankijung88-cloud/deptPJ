import pool from './server/config/db.js';

async function check() {
  const [rows] = await pool.query("SELECT id, page_type, title, agency_id, category FROM featured_items WHERE agency_id = 1 OR category = 'floor-2'");
  console.log(rows);
  process.exit();
}
check();
