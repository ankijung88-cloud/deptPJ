import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkBase64() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        // Check if image_url has base64 data
        const [rows] = await pool.query('SELECT id, image_url FROM featured_items WHERE image_url LIKE "data:%" LIMIT 1');
        if (rows.length > 0) {
            console.log('Found Base64 data in image_url!');
        } else {
            console.log('No Base64 data found in image_url.');
            
            // Just show some sample image_urls to see what they look like
            const [samples] = await pool.query('SELECT image_url FROM featured_items LIMIT 5');
            console.log('Sample image_urls:', samples.map(s => s.image_url));
        }

        await pool.end();
    } catch (e) {
        console.error('Check Failed:', e.message);
    }
}

checkBase64();
