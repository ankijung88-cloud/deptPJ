import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const bucketName = 'dept-media';

const logPath = 'C:\\dev\\DEPT-Pj2-main\\upload_log.txt';
function myLog(msg: string) {
    fs.appendFileSync(logPath, msg + '\n');
}

myLog('Starting upload script...');

if (!supabaseUrl || !supabaseKey) {
    myLog('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadMissing() {
    const filesToUpload = ['trand.mp4', 'experience.mp4'];
    const videoDir = path.join(process.cwd(), 'public', 'video');

    for (const file of filesToUpload) {
        const localPath = path.join(videoDir, file);
        const storagePath = `video/${file}`;

        myLog(`Uploading ${file}...`);
        try {
            const fileBuffer = fs.readFileSync(localPath);

            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(storagePath, fileBuffer, {
                    contentType: 'video/mp4',
                    upsert: true
                });

            if (error) {
                myLog(`Error uploading ${file}: ${error.message}`);
            } else {
                myLog(`Success uploading ${file}`);
            }
        } catch (e: any) {
            myLog(`Caught exception for ${file}: ${e.message}`);
        }
    }
}

uploadMissing().then(() => {
    myLog('All done.');
    process.exit(0);
});
