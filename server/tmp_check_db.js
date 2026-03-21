import pool from './config/db.js';

async function check() {
  try {
    const [rows] = await pool.query('SELECT DISTINCT subcategory FROM featured_items');
    console.log('Unique subcategories in DB:');
    console.log(JSON.stringify(rows.map(r => r.subcategory), null, 2));

    const [items] = await pool.query('SELECT id, title, subcategory, agency_id FROM featured_items LIMIT 20');
    console.log('\nSample items:');
    console.log(JSON.stringify(items, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
