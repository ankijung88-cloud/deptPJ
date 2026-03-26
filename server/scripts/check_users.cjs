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

    console.log('--- DB USER CHECK ---');
    try {
        const connection = await mysql.createConnection({
            host: env.DB_HOST,
            user: env.DB_USER,
            password: env.DB_PASS,
            database: env.DB_NAME,
            connectTimeout: 5000
        });
        const [rows] = await connection.query('SELECT id, username, role FROM users');
        console.log(`TOTAL_USERS: ${rows.length}`);
        rows.forEach(r => {
            console.log(`USER: ${r.username} (${r.role})`);
        });
        await connection.end();
    } catch (err) {
        console.error('DB_ERROR:', err.message);
    }
}

check();
