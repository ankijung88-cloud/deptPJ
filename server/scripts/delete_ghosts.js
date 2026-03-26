import pool from '../config/db.js';

const TEMPLATE_CATEGORIES = ['cinema', 'museum', 'store', 'ticket'];

async function findAndDeleteGhosts() {
    try {
        console.log('--- STARTING CLEANUP ---');
        const [rows] = await pool.query('SELECT id, title, category FROM featured_items');
        
        const ghostIds = [];
        rows.forEach(r => {
            const isFloor = r.category && r.category.startsWith('floor-');
            const isTemplate = TEMPLATE_CATEGORIES.includes(r.category);
            
            // Criteria: No category, OR not a floor AND not a standard template
            if (!r.category || (!isFloor && !isTemplate)) {
                ghostIds.push(r.id);
                console.log(`FOUND GHOST: ID=${r.id}, Category=${r.category}`);
            }
        });

        if (ghostIds.length > 0) {
            console.log(`Deleting ${ghostIds.length} ghost items...`);
            await pool.query('DELETE FROM featured_items WHERE id IN (?)', [ghostIds]);
            console.log('Cleanup successful.');
        } else {
            console.log('No ghost items found.');
        }
    } catch (err) {
        console.error('Cleanup failed:', err.message);
    } finally {
        process.exit();
    }
}

findAndDeleteGhosts();
