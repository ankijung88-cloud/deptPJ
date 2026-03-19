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
    const [rows] = await connection.execute('SELECT id, title, selected_templates FROM featured_items WHERE selected_templates IS NOT NULL AND selected_templates != "[]"');
    console.log('--- Items with Selected Templates ---');
    rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Title: ${JSON.stringify(row.title)}`);
      console.log(`Selected Templates: ${row.selected_templates}`);
      console.log('------------------------------------');
    });
    
    if (rows.length === 0) {
      console.log('No items found with selected_templates.');
      const [all] = await connection.execute('SELECT id, title, selected_templates FROM featured_items LIMIT 5');
      console.log('--- Sample Items ---');
      all.forEach(row => {
        console.log(`ID: ${row.id}, Templates: ${row.selected_templates}`);
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

check();
