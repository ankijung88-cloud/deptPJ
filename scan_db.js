require('dotenv').config();
const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    const [rows] = await connection.execute('SELECT id, title, category, subcategory, parent_id, page_type FROM featured_items');
    console.log('--- Database Content ---');
    rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Title: ${row.title}`);
      console.log(`Category: ${row.category}`);
      console.log(`Parent: ${row.parent_id}`);
      console.log(`Type: ${row.page_type}`);
      console.log('------------------------');
    });
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

check();
