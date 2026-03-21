import pool from './config/db.js';

async function verify() {
  try {
    const [rows] = await pool.query('DESCRIBE users');
    console.log('USERS_TABLE_DESCRIPTION:');
    console.log(JSON.stringify(rows, null, 2));

    const [adminRow] = await pool.query('SELECT username, role, status FROM users WHERE role = "ADMIN" LIMIT 1');
    console.log('ADMIN_USER_STATUS:');
    console.log(JSON.stringify(adminRow, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('VERIFICATION_FAILED:', err);
    process.exit(1);
  }
}

verify();
