import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function inspectDataContent() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('--- Inspecting FEATURED_ITEMS Content ---');
        const [products] = await pool.query('SELECT * FROM featured_items LIMIT 1');
        if (products.length > 0) {
            Object.entries(products[0]).forEach(([key, value]) => {
                const displayValue = (value instanceof Buffer) ? `[Buffer of ${value.length} bytes]` : 
                                   (typeof value === 'string' && value.length > 100) ? `${value.substring(0, 100)}... (truncated)` : value;
                console.log(`${key}: ${displayValue}`);
            });
        }

        console.log('\n--- Inspecting HERO_IMAGES Content ---');
        const [heroes] = await pool.query('SELECT * FROM hero_images LIMIT 1');
        if (heroes.length > 0) {
            Object.entries(heroes[0]).forEach(([key, value]) => {
                const displayValue = (value instanceof Buffer) ? `[Buffer of ${value.length} bytes]` : 
                                   (typeof value === 'string' && value.length > 100) ? `${value.substring(0, 100)}... (truncated)` : value;
                console.log(`${key}: ${displayValue}`);
            });
        }

        await pool.end();
    } catch (e) {
        console.error('Inspection Failed:', e.message);
    }
}

inspectDataContent();
