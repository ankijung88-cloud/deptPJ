import pool from './server/config/db.js';

async function fixNames() {
  try {
    const [landings] = await pool.query('SELECT * FROM featured_items WHERE page_type = ? AND agency_id IS NOT NULL', ['project_landing']);
    for (const landing of landings) {
      if (!landing.metadata) continue;
      let md = typeof landing.metadata === 'string' ? JSON.parse(landing.metadata) : landing.metadata;
      console.log('Fixing for agency', landing.agency_id, 'with logo text', md.headerLogoText);
      const [children] = await pool.query('SELECT * FROM featured_items WHERE agency_id = ? AND page_type IN (?, ?, ?, ?, ?)', [landing.agency_id, 'curation', 'skincare', 'brand', 'magazine', 'community']);
      for (const child of children) {
        let childMd = typeof child.metadata === 'string' ? JSON.parse(child.metadata) : (child.metadata || {});
        childMd.headerLogoText = md.headerLogoText;
        childMd.headerLogoUrl = md.headerLogoUrl;
        childMd.navLinks = md.navLinks;
        await pool.query('UPDATE featured_items SET metadata = ? WHERE id = ?', [JSON.stringify(childMd), child.id]);
        console.log('  Updated child', child.id, child.page_type);
      }
    }
    console.log("Done");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
fixNames();
