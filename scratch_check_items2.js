import pool from './server/config/db.js';

async function check() {
  const [rows] = await pool.query("SELECT id, page_type, agency_id, title FROM featured_items WHERE page_type IN ('brand', 'curation', 'magazine', 'community', 'skincare')");
  console.log('Special Pages:', rows);
  
  const [metadataRows] = await pool.query("SELECT id, page_type, metadata FROM featured_items WHERE page_type IN ('brand', 'curation', 'magazine', 'community', 'skincare')");
  for (const r of metadataRows) {
     const md = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : (r.metadata || {});
     console.log(`[${r.id}] ${r.page_type} - logoText: ${md.headerLogoText}`);
  }
  process.exit();
}
check();
