import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function listAllTables() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        const [rows] = await pool.query('SHOW TABLES');
        console.log('Tables:', rows.map(r => Object.values(r)[0]));
        
        await pool.end();
    } catch (e) {
        console.error('Connection Failed:', e.message);
    }
}

listAllTables();
