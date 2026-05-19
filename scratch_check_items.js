import pool from './server/config/db.js';

async function check() {
  const [rows] = await pool.query('SELECT id, page_type, agency_id, title FROM featured_items');
  console.log(rows.filter(r => r.page_type && ['curation', 'skincare', 'brand', 'magazine', 'community', 'project_landing'].includes(r.page_type)));
  process.exit();
}
check();
