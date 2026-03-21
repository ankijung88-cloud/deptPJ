import pool from './config/db.js';

async function check() {
  try {
    console.log('--- DB CHECK START ---');
    const [rows] = await pool.query('SELECT DISTINCT subcategory FROM featured_items');
    console.log('SUBS:' + JSON.stringify(rows.map(r => r.subcategory)));
    
    const [items] = await pool.query('SELECT id, title, subcategory, agency_id FROM featured_items LIMIT 5');
    console.log('ITEMS:' + JSON.stringify(items));
    
    const [users] = await pool.query('SELECT id, username, role FROM users');
    console.log('USERS:' + JSON.stringify(users));
    
    console.log('--- DB CHECK END ---');
  } catch (err) {
    console.error('FAIL:' + err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}
check();
