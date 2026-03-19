import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './server/.env' });

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    try {
        const [columns] = await connection.execute('DESCRIBE featured_items');
        console.log('--- Columns in featured_items table ---');
        console.log(JSON.stringify(columns, null, 2));

        const [products] = await connection.execute('SELECT * FROM featured_items LIMIT 1');
        console.log('\n--- Sample Product Data ---');
        console.log(JSON.stringify(products, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

run();
