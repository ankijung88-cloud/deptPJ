import pool from './server/config/db.js';

async function check() {
  const [rows] = await pool.query("SELECT id, title, page_type FROM featured_items WHERE title LIKE '%신선마켓%' OR metadata LIKE '%신선마켓%'");
  console.log(rows);
  process.exit();
}
check();
