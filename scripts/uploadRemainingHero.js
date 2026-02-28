require('dotenv').config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL) require('dotenv').config({ path: '.env' });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const bucketName = 'dept-media';

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadMissing() {
    const filesToUpload = ['trand.mp4', 'experience.mp4'];
    const videoDir = path.join(process.cwd(), 'public', 'video');

    for (const file of filesToUpload) {
        const localPath = path.join(videoDir, file);
        const storagePath = `video/${file}`;

        console.log(`Uploading ${file}...`);
        const fileBuffer = fs.readFileSync(localPath);

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(storagePath, fileBuffer, {
                contentType: 'video/mp4',
                upsert: true
            });

        if (error) {
            console.error(`Error uploading ${file}:`, error);
        } else {
            console.log(`Success uploading ${file}`);
        }
    }
}

uploadMissing().then(() => console.log('All done.'));
