require('dotenv').config({path: './server/.env'});
const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    const templates = ['cinema', 'museum', 'store', 'ticket'];
    const [rows] = await connection.execute(
      'SELECT id, title, category FROM featured_items WHERE category IN (?, ?, ?, ?) AND parent_id IS NULL',
      templates
    );
    
    console.log('--- Potentially Corrupted Parent Items ---');
    rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Title: ${row.title}`);
      console.log(`Current Category: ${row.category}`);
      console.log('-----------------------------------------');
    });
    
    if (rows.length === 0) {
      console.log('No corrupted items found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

check();
