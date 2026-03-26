const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function check() {
    const envPath = path.join(__dirname, '../.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
    });

    console.log('--- DB CHECK ---');
    try {
        const connection = await mysql.createConnection({
            host: env.DB_HOST,
            user: env.DB_USER,
            password: env.DB_PASS,
            database: env.DB_NAME,
            connectTimeout: 5000
        });
        console.log('Connected to', env.DB_NAME);
        const [rows] = await connection.query('SELECT id, category, title FROM featured_items');
        console.log(`TOTAL_ITEMS: ${rows.length}`);
        
        const TEMPLATE_CATEGORIES = ['cinema', 'museum', 'store', 'ticket'];
        rows.forEach(r => {
            const isFloor = r.category && r.category.startsWith('floor-');
            const isTemplate = TEMPLATE_CATEGORIES.includes(r.category);
            if (!r.category || (!isFloor && !isTemplate)) {
                console.log(`GHOST_FOUND: ID=${r.id}, Category=${r.category}`);
            }
        });
        await connection.end();
    } catch (err) {
        console.error('DB_ERROR:', err.message);
    }
}

check();
