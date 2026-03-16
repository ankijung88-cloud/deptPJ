import pool from './config/db.js';

async function diagnose() {
  try {
    const [rows] = await pool.query('SHOW CREATE TABLE floor_categories');
    console.log('--- DB Schema for floor_categories ---');
    console.log(rows[0]['Create Table']);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

diagnose();
