import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const bucketName = 'dept-media';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFiles() {
    const { data, error } = await supabase.storage.from(bucketName).list('video');
    if (error) {
        console.error('Error listing files:', error.message);
        return;
    }

    const filesFound = data.map(f => f.name);
    console.log('Files in dept-media/video:');
    filesFound.forEach(name => console.log(' - ' + name));

    const targetFiles = ['trend.mp4', 'active.mp4', 'popup_store.mp4', 'festival.mp4', 'travel.mp4'];
    console.log('\nVerification Status:');
    targetFiles.forEach(target => {
        const exists = filesFound.includes(target);
        console.log(`[${exists ? 'OK' : 'MISSING'}] ${target}`);
    });
}

checkFiles();
