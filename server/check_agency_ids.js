import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkDB() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        const [rows] = await pool.query('DESCRIBE featured_items');
        console.log('Featured Items Schema:', rows.map(r => r.Field));
        
        const [agencyRows] = await pool.query('SELECT DISTINCT agency_id FROM featured_items');
        console.log('Distinct Agency IDs in products:', agencyRows);

        await pool.end();
    } catch (e) {
        console.error('Connection Failed:', e.message);
    }
}

checkDB();
