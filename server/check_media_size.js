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

        const [rows] = await pool.query('SELECT SUM(LENGTH(data)) as total_size FROM media_storage');
        console.log('Total Binary Size in DB (Bytes):', rows[0].total_size || 0);
        
        const [nullCount] = await pool.query('SELECT COUNT(*) as count FROM media_storage WHERE data IS NULL');
        console.log('Records with NULL data (SSD-based):', nullCount[0].count);

        const [nonNullCount] = await pool.query('SELECT COUNT(*) as count FROM media_storage WHERE data IS NOT NULL');
        console.log('Records with NON-NULL data (DB-based):', nonNullCount[0].count);

        await pool.end();
    } catch (e) {
        console.error('Connection Failed:', e.message);
    }
}

checkDB();
