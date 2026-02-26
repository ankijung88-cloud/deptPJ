import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const bucketName = 'dept-media';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadFile(localPath: string, storagePath: string, contentType: string) {
    if (!fs.existsSync(localPath)) {
        console.warn(`File not found, skipping: ${localPath}`);
        return null;
    }

    console.log(`Uploading ${localPath} to ${bucketName}/${storagePath}...`);
    const fileBuffer = fs.readFileSync(localPath);

    // First, try to upload. If it exists, Supabase Storage usually errors unless upsert is true
    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, fileBuffer, {
            contentType: contentType,
            upsert: true
        });

    if (error) {
        console.error(`Error uploading ${localPath}:`, error);
        return null;
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
    console.log(`Success! Public URL: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
}

async function processMedia() {
    console.log('Starting media upload process...');
    const projectRoot = path.resolve(__dirname, '..');

    // 1. Upload Videos from public/video/
    const videoDir = path.join(projectRoot, 'public', 'video');
    const videoFiles = fs.existsSync(videoDir) ? fs.readdirSync(videoDir).filter(f => f.endsWith('.mp4')) : [];

    const videoUrlMap: Record<string, string> = {};

    for (const file of videoFiles) {
        const localPath = path.join(videoDir, file);
        const storagePath = `video/${file}`;
        const publicUrl = await uploadFile(localPath, storagePath, 'video/mp4');
        if (publicUrl) {
            videoUrlMap[`./video/${file}`] = publicUrl;
        }
    }

    // Update Database records for live_shorts
    console.log('Updating DB records for live_shorts...');
    const { data: shortsData, error: shortsError } = await supabase.from('live_shorts').select('id, video_url');
    if (shortsError) {
        console.error('Failed to fetch live_shorts:', shortsError);
    } else {
        for (const short of shortsData) {
            if (short.video_url && videoUrlMap[short.video_url]) {
                const newUrl = videoUrlMap[short.video_url];
                console.log(`Updating short ${short.id} video_url to ${newUrl}`);
                await supabase.from('live_shorts').update({ video_url: newUrl }).eq('id', short.id);
            }
        }
    }

    console.log('Media processing complete!');
}

processMedia();
