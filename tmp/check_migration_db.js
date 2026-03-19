import pool from '../server/config/db.js';

async function check() {
  try {
    console.log('--- Media Storage ---');
    const [media] = await pool.query('SELECT filename, mimetype, LENGTH(data) as size FROM media_storage LIMIT 5');
    media.forEach(r => console.log(`- ${r.filename} (${r.mimetype}, ${r.size} bytes)`));

    console.log('\n--- Featured Items ---');
    const [items] = await pool.query('SELECT id, title, image_url, video_url FROM featured_items LIMIT 5');
    items.forEach(r => console.log(`- [${r.id}] ${r.title}: img=${r.image_url}, video=${r.video_url}`));
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
