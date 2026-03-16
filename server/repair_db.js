import pool from './config/db.js';

async function repair() {
    try {
        console.log('--- DB REPAIR START ---');
        
        // 1. Check if table exists, if not create it with correct types
        console.log('Ensuring table floor_categories exists with VARCHAR ID...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS floor_categories (
                id VARCHAR(50) PRIMARY KEY,
                floor VARCHAR(10),
                title JSON,
                description JSON,
                bg_image TEXT,
                content JSON,
                subitems JSON,
                color VARCHAR(20),
                video_url TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 2. Check current schema of 'id' column
        const [columns] = await pool.query('DESCRIBE floor_categories');
        const idCol = columns.find(c => c.Field === 'id');
        console.log('Current ID column type:', idCol.Type);

        if (!idCol.Type.toLowerCase().includes('varchar') && !idCol.Type.toLowerCase().includes('text')) {
            console.log('ID column is not VARCHAR/TEXT. Attempting to convert...');
            // This might fail if there's incompatible data, so we're careful
            await pool.query('ALTER TABLE floor_categories MODIFY COLUMN id VARCHAR(50)');
            console.log('Conversion successful.');
        }

        console.log('--- DB REPAIR END ---');
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('REPAIR ERROR:', err);
        process.exit(1);
    }
}

repair();
