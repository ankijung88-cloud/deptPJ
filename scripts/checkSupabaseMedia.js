require('dotenv').config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL) require('dotenv').config({ path: '.env' });

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

let output = '';
function log(msg) {
    output += msg + '\n';
    fs.writeFileSync('scripts/mediaOutput.txt', output);
}

if (!supabaseUrl) {
    log('No supabase url found');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMedia() {
    const bucketName = 'dept-media';
    log(`Checking bucket: ${bucketName}...`);
    const { data, error } = await supabase.storage.from(bucketName).list('video', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
        log('Error: ' + error.message);
    } else {
        log('Files in dept-media/video: ' + (data ? data.map(f => f.name).join(', ') : 'none'));

        const heroVideos = ['festival.mp4', 'popup_store.mp4', 'trand.mp4', 'experience.mp4', 'travel.mp4'];
        log('\nChecking size of hero videos:');
        for (const v of heroVideos) {
            const file = data.find(f => f.name === v);
            if (file) {
                log(`- ${v}: ${(file.metadata.size / (1024 * 1024)).toFixed(2)} MB`);
            } else {
                log(`- ${v}: Not found`);
            }
        }
    }
}
checkMedia();
