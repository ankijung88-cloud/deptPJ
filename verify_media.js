require('dotenv').config();
const mysql = require('mysql2/promise');

async function verify() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'admin',
    password: 'Bingsoo2019!!!',
    database: 'dept_db'
  });

  try {
    console.log('--- Checking Featured Items (Templates) ---');
    const [products] = await connection.execute('SELECT id, title, category, subcategory, parent_id, image_url FROM products WHERE category IN ("cinema", "museum", "ticket", "store")');
    products.forEach(p => {
        console.log(`ID: ${p.id} | Title: ${p.title} | Cat: ${p.category} | Parent: ${p.parent_id}`);
        console.log(`  Img: ${p.image_url}`);
    });

    console.log('\n--- Checking Media Storage (Metadata) ---');
    const [media] = await connection.execute('SELECT id, filename, mimetype, created_at FROM media_storage ORDER BY created_at DESC LIMIT 10');
    media.forEach(m => {
        console.log(`ID: ${m.id} | File: ${m.filename} | Type: ${m.mimetype} | Created: ${m.created_at}`);
    });

  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    await connection.end();
  }
}

verify();
