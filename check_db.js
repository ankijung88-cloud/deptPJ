import pool from './server/config/db.js';

async function checkData() {
  try {
    const [products] = await pool.query('SELECT count(*) as count FROM featured_items');
    const [heroes] = await pool.query('SELECT count(*) as count FROM hero_images');
    const [floors] = await pool.query('SELECT count(*) as count FROM floor_categories');
    const [features] = await pool.query('SELECT count(*) as count FROM landing_features');
    const [media] = await pool.query('SELECT count(*) as count, count(data) as blob_count FROM media_storage');

    console.log('--- Database Status ---');
    console.log('featured_items:', products[0].count);
    console.log('hero_images:', heroes[0].count);
    console.log('floor_categories:', floors[0].count);
    console.log('landing_features:', features[0].count);
    console.log('media_storage (total):', media[0].count);
    console.log('media_storage (with blobs):', media[0].blob_count);

    if (products[0].count > 0) {
        const [sample] = await pool.query('SELECT id, title, image_url FROM featured_items LIMIT 3');
        console.log('\n--- Products Sample ---');
        console.log(JSON.stringify(sample, null, 2));
    }
    
    if (heroes[0].count > 0) {
        const [sample] = await pool.query('SELECT id, image_url FROM hero_images LIMIT 3');
        console.log('\n--- Hero Images Sample ---');
        console.log(JSON.stringify(sample, null, 2));
    }

    if (features[0].count > 0) {
        const [sample] = await pool.query('SELECT id, feature_id, title, media_url FROM landing_features LIMIT 3');
        console.log('\n--- Landing Features Sample ---');
        console.log(JSON.stringify(sample, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkData();
