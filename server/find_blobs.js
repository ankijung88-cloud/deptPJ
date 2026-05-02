import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function findBlobColumns() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        const tables = ['featured_items', 'hero_images', 'floor_categories', 'media_storage'];
        
        for (const table of tables) {
            const [cols] = await pool.query(`DESCRIBE ${table}`);
            const blobCols = cols.filter(c => c.Type.toLowerCase().includes('blob'));
            if (blobCols.length > 0) {
                console.log(`Table ${table} has BLOB columns:`, blobCols.map(c => c.Field));
                
                // Check if any of these columns have data
                for (const col of blobCols) {
                    const [data] = await pool.query(`SELECT COUNT(*) as count FROM ${table} WHERE ${col.Field} IS NOT NULL AND LENGTH(${col.Field}) > 0`);
                    console.log(`  - Column ${col.Field} has data in ${data[0].count} rows.`);
                }
            } else {
                console.log(`Table ${table} has NO BLOB columns.`);
            }
        }

        await pool.end();
    } catch (e) {
        console.error('Check Failed:', e.message);
    }
}

findBlobColumns();
