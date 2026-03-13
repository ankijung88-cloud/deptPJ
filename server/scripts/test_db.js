import pool from '../config/db.js';

async function testConn() {
  try {
    console.log('Testing connection...');
    const [rows] = await pool.query('SELECT 1 as ok');
    console.log('Connection OK:', rows[0].ok);
    process.exit(0);
  } catch (err) {
    console.error('Connection FAILED:', err.message);
    process.exit(1);
  }
}

testConn();
