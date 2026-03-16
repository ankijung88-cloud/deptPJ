import pool from './config/db.js';

async function diagnose() {
  try {
    const [rows] = await pool.query('SELECT floor, subitems FROM floor_categories WHERE floor = "6F"');
    console.log('--- DB Subitems for 6F ---');
    console.log(JSON.stringify(rows[0], null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

diagnose();
