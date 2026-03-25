import pool from './config/db.js';

async function clearFloorImages() {
  try {
    console.log('Connecting to database...');
    const [result] = await pool.query('UPDATE floor_categories SET bg_image = NULL');
    console.log('Update successful. Rows affected:', result.affectedRows);
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

clearFloorImages();
