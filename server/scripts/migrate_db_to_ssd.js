import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

async function migrate() {
    console.log('[Migration] Starting DB to SSD migration...');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
        console.log(`[Migration] Creating directory: ${uploadDir}`);
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
        console.log('[Migration] Fetching file IDs from database...');
        // Only fetch IDs first to avoid loading all BLOBs into memory at once
        const [idRows] = await pool.query('SELECT id FROM media_storage WHERE data IS NOT NULL');
        
        console.log(`[Migration] Found ${idRows.length} files to migrate.`);

        for (let i = 0; i < idRows.length; i++) {
            const { id } = idRows[i];
            
            // Fetch one record at a time to keep RAM usage low
            const [rows] = await pool.query('SELECT filename, mimetype, data FROM media_storage WHERE id = ?', [id]);
            if (rows.length === 0) continue;

            const { filename, data } = rows[0];
            const filePath = path.join(uploadDir, filename);

            try {
                process.stdout.write(`[Migration] (${i+1}/${idRows.length}) Processing: ${filename} ... `);
                
                // Save BLOB data to file
                fs.writeFileSync(filePath, data);
                
                // Null out the data column to free up DB space
                await pool.query('UPDATE media_storage SET data = NULL WHERE id = ?', [id]);
                
                console.log('Done.');
            } catch (err) {
                console.log('Failed.');
                console.error(`[Migration] Error migrating ${filename}:`, err.message);
            }
        }

        console.log('[Migration] Finished. All files have been moved to SSD.');
        process.exit(0);
    } catch (error) {
        console.error('[Migration] Critical Error:', error.message);
        process.exit(1);
    }
}

migrate();
