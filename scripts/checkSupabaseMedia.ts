import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMedia() {
    const bucketName = 'dept-media';
    console.log(`Checking bucket: ${bucketName}...`);
    const { data, error } = await supabase.storage.from(bucketName).list('video', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
        console.error('Error:', error.message);
    } else {
        const list = data?.map((f: any) => f.name) || [];
        console.log('Files in dept-media/video:', list);

        const heroVideos = ['festival.mp4', 'popup_store.mp4', 'trand.mp4', 'experience.mp4', 'travel.mp4'];
        console.log('\nChecking size of hero videos:');
        for (const v of heroVideos) {
            const file: any = data?.find((f: any) => f.name === v);
            if (file) {
                console.log(`- ${v}: ${(file.metadata.size / (1024 * 1024)).toFixed(2)} MB`);
            } else {
                console.log(`- ${v}: Not found`);
            }
        }
    }
}
checkMedia();
