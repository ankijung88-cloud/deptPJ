import pool from './server/config/db.js';

async function checkMediaData() {
  try {
    const [rows] = await pool.query("SELECT filename, mimetype, LENGTH(data) as size FROM media_storage WHERE filename = '1775290544803-175723089.png'");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkMediaData();
