import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './server/.env' });

async function run() {
    console.log('Connecting to DB...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    try {
        console.log('Querying...');
        const [rows] = await connection.execute('SELECT id, theme_data FROM featured_items WHERE theme_data IS NOT NULL LIMIT 1');
        console.log('\n--- Theme Data Example ---');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
        console.log('Disconnected.');
        process.exit(0);
    }
}

run();
