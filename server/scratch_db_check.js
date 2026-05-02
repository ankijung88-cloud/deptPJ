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
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const [allTables] = await pool.query('SHOW TABLES');
        console.log('Available Tables:', allTables.map(t => Object.values(t)[0]));

        const tables = ['featured_items', 'floor_categories', 'hero_images', 'landing_features', 'media_storage'];
        console.log('\n--- Database Integrity Report ---');
        
        for (const table of tables) {
            try {
                const [rows] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`${table}: ${rows[0].count} records found.`);
                
                if (table === 'featured_items' && rows[0].count > 0) {
                    const [cats] = await pool.query(`SELECT DISTINCT category FROM ${table}`);
                    console.log(`  Categories: ${cats.map(c => c.category).join(', ')}`);
                }
                
                if (table === 'media_storage' && rows[0].count > 0) {
                    const [dataRows] = await pool.query(`SELECT COUNT(*) as count FROM ${table} WHERE data IS NOT NULL`);
                    console.log(`  Records with Binary Data (Safe): ${dataRows[0].count}`);
                    const [sampleMedia] = await pool.query(`SELECT filename, mimetype, (data IS NULL) as is_data_null FROM ${table} LIMIT 3`);
                    console.log(`  Sample Media: ${JSON.stringify(sampleMedia)}`);
                }
            } catch (err) {
                console.error(`${table}: ERROR - ${err.message}`);
            }
        }
        await pool.end();
    } catch (e) {
        console.error('Connection Failed:', e.message);
    }
}

checkDB();
