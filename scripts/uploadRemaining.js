import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const bucketName = 'dept-media';

console.log('Starting ESM upload script...');

if (!supabaseUrl || !supabaseKey) {
    console.log('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadMissing() {
    const filesToUpload = ['trand.mp4', 'experience.mp4'];
    const videoDir = path.join(process.cwd(), 'public', 'video');

    for (const file of filesToUpload) {
        const localPath = path.join(videoDir, file);
        const storagePath = `video/${file}`;

        console.log(`Uploading ${file}...`);
        try {
            const fileBuffer = fs.readFileSync(localPath);

            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(storagePath, fileBuffer, {
                    contentType: 'video/mp4',
                    upsert: true
                });

            if (error) {
                console.error(`Error uploading ${file}:`, error.message);
            } else {
                console.log(`Success uploading ${file}`);
            }
        } catch (e) {
            console.error(`Caught exception for ${file}:`, e.message);
        }
    }
}

uploadMissing().then(() => {
    console.log('All done.');
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
