import pool from './config/db.js';

async function diagnose() {
  try {
    const [rows] = await pool.query('SELECT id, floor, title FROM floor_categories');
    console.log('--- DB Floor Categories ---');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

diagnose();
