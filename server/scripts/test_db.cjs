const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

async function test() {
    console.log('Connecting to:', env.DB_HOST, env.DB_NAME);
    const connection = await mysql.createConnection({
        host: env.DB_HOST,
        user: env.DB_USER,
        password: env.DB_PASS,
        database: env.DB_NAME
    });
    console.log('Connected!');
    const [rows] = await connection.query('SELECT id, title, category FROM featured_items');
    console.log('Found rows:', rows.length);
    rows.forEach(r => {
        // If it's a "ghost", print it.
        // Rule: not a floor and not a known template? Or just no category.
        const title = typeof r.title === 'string' ? r.title : JSON.stringify(r.title);
        if (!r.category || (!r.category.startsWith('floor-') && !['cinema', 'museum', 'store', 'ticket'].includes(r.category))) {
            console.log(`GHOST_FOUND: ID=${r.id}, Title=${title}, Category=${r.category}`);
        }
    });
    await connection.end();
}

test().catch(console.error);
