import pool from '../config/db.js';

/**
 * Maintenance Utility for DEPT-Pj2
 * Consolidates ghost record finding, deletion, and user auditing.
 */

const TEMPLATE_CATEGORIES = ['cinema', 'museum', 'store', 'ticket'];

/**
 * Validates if a category is standard (floor or known template)
 */
const isStandardCategory = (category) => {
    if (!category) return false;
    const isFloor = category.startsWith('floor-');
    const isTemplate = TEMPLATE_CATEGORIES.includes(category);
    return isFloor || isTemplate;
};

/**
 * Finds "ghost" records in featured_items
 * (Items without a valid category or floor assignment)
 */
export async function findGhosts() {
    console.log('\n--- Finding Ghost Items ---');
    try {
        const [rows] = await pool.query('SELECT id, title, category, subcategory FROM featured_items');
        const ghosts = rows.filter(item => !isStandardCategory(item.category));
        
        if (ghosts.length === 0) {
            console.log('No ghost items found.');
            return [];
        }

        ghosts.forEach(item => {
            const title = typeof item.title === 'string' ? item.title : JSON.stringify(item.title);
            console.log(`[GHOST] ID: ${item.id} | Title: ${title} | Cat: ${item.category}`);
        });
        console.log(`Total ghosts found: ${ghosts.length}`);
        return ghosts;
    } catch (err) {
        console.error('Error finding ghosts:', err.message);
        throw err;
    }
}

/**
 * Deletes "ghost" records from featured_items
 */
export async function deleteGhosts() {
    console.log('\n--- Deleting Ghost Items ---');
    try {
        const ghosts = await findGhosts();
        if (ghosts.length === 0) return;

        const ids = ghosts.map(g => g.id);
        const [result] = await pool.query('DELETE FROM featured_items WHERE id IN (?)', [ids]);
        console.log(`Successfully deleted ${result.affectedRows} items.`);
    } catch (err) {
        console.error('Error deleting ghosts:', err.message);
        throw err;
    }
}

/**
 * Audits registered users and their roles
 */
export async function auditUsers() {
    console.log('\n--- Registered User Audit ---');
    try {
        const [rows] = await pool.query('SELECT id, username, role, agency_name FROM users');
        console.log(`Total users: ${rows.length}`);
        rows.forEach(user => {
            console.log(`- ${user.username.padEnd(15)} | Role: ${user.role.padEnd(10)} | Agency: ${user.agency_name || 'N/A'}`);
        });
    } catch (err) {
        console.error('Error auditing users:', err.message);
        throw err;
    }
}

/**
 * Tests database connectivity
 */
export async function testConnection() {
    console.log('\n--- Database Connection Test ---');
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        if (rows[0].solution === 2) {
            console.log('Connection: OK');
        }
    } catch (err) {
        console.error('Connection: FAILED -', err.message);
        throw err;
    }
}

// CLI Support: node maintenance.js [find|delete|users|test]
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
    const action = process.argv[2] || 'test';
    
    (async () => {
        try {
            switch (action) {
                case 'find': await findGhosts(); break;
                case 'delete': await deleteGhosts(); break;
                case 'users': await auditUsers(); break;
                case 'test': await testConnection(); break;
                case 'all':
                    await testConnection();
                    await auditUsers();
                    await findGhosts();
                    break;
                default:
                    console.log('Usage: node maintenance.js [find|delete|users|test|all]');
            }
        } catch (e) {
            // Error already logged
        } finally {
            process.exit();
        }
    })();
}
