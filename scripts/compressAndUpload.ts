import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

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

// Helper to compress video
function compressVideo(inputPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        console.log(`Compressing ${path.basename(inputPath)}... This may take a few minutes.`);

        (ffmpeg as any)(inputPath)
            .outputOptions([
                '-crf 28',        // Compression quality (lower is better, 28 is a good balance for web)
                '-preset fast',   // Speed of compression
                '-vcodec libx264',// Video codec
                '-acodec aac',    // Audio codec
                '-b:a 128k',      // Audio bitrate
                '-movflags +faststart' // Optimize for web streaming
            ])
            .on('end', () => {
                console.log(`Successfully compressed ${path.basename(inputPath)}`);
                resolve(outputPath);
            })
            .on('error', (err: any) => {
                console.error(`Error compressing ${path.basename(inputPath)}:`, err);
                reject(err);
            })
            .save(outputPath);
    });
}

async function uploadFile(localPath: string, storagePath: string, contentType: string) {
    if (!fs.existsSync(localPath)) {
        console.warn(`File not found, skipping: ${localPath}`);
        return null;
    }

    console.log(`Uploading ${localPath} to ${bucketName}/${storagePath}...`);
    const fileBuffer = fs.readFileSync(localPath);

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

async function processFailedMedia() {
    console.log('Starting compression and upload process for failed files...');
    const projectRoot = path.resolve(__dirname, '..');
    const videoDir = path.join(projectRoot, 'public', 'video');

    // The files that failed due to 50MB limit
    const failedFiles = ['festival.mp4', 'popup_store.mp4', 'travel.mp4'];
    const videoUrlMap: Record<string, string> = {};

    for (const file of failedFiles) {
        const inputPath = path.join(videoDir, file);
        const compressedPath = path.join(videoDir, `compressed_${file}`);

        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${file} as it does not exist.`);
            continue;
        }

        try {
            // 1. Compress
            if (!fs.existsSync(compressedPath)) {
                await compressVideo(inputPath, compressedPath);
            } else {
                console.log(`Compressed file ${compressedPath} already exists, skipping compression.`);
            }

            // 2. Upload original name, but using compressed file
            const storagePath = `video/${file}`;
            const publicUrl = await uploadFile(compressedPath, storagePath, 'video/mp4');

            if (publicUrl) {
                videoUrlMap[`./video/${file}`] = publicUrl;
                // Optional: Clean up compressed temp file
                fs.unlinkSync(compressedPath);
            }
        } catch (error) {
            console.error(`Failed to process ${file}`, error);
        }
    }

    // 3. Update DB
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

    console.log('Compression and upload process complete!');
}

processFailedMedia();
