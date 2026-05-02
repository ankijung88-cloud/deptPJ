import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkDBBinary() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        // Check if data column actually has content for some rows
        const [rows] = await pool.query('SELECT id, filename, LENGTH(data) as len FROM media_storage WHERE data IS NOT NULL LIMIT 5');
        console.log('Sample records with data length:', rows);
        
        const [total] = await pool.query('SELECT COUNT(*) as count, SUM(LENGTH(data)) as total_bytes FROM media_storage');
        console.log('Total media records:', total[0]);

        await pool.end();
    } catch (e) {
        console.error('Connection Failed:', e.message);
    }
}

checkDBBinary();
