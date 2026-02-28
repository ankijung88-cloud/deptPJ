import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
dotenv.config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const bucketName = 'dept-media';

if (!supabaseUrl || !supabaseKey) {
    console.log('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function compressVideo(inputPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        console.log(`Compressing ${path.basename(inputPath)}... This may take a few minutes.`);

        (ffmpeg as any)(inputPath)
            .outputOptions([
                '-crf 28',        // Compression quality (lower is better, 28 is a very good balance for web)
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

async function processMissingMedia() {
    console.log('Starting compression and upload process for remaining files...');
    const videoDir = path.join(process.cwd(), 'public', 'video');
    const filesToUpload = ['trand.mp4', 'experience.mp4'];

    for (const file of filesToUpload) {
        const inputPath = path.join(videoDir, file);
        const compressedPath = path.join(videoDir, `compressed_${file}`);

        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${file} as it does not exist.`);
            continue;
        }

        try {
            // Compress
            if (!fs.existsSync(compressedPath)) {
                await compressVideo(inputPath, compressedPath);
            } else {
                console.log(`Compressed file ${compressedPath} already exists.`);
            }

            // Upload
            console.log(`Uploading ${file}...`);
            const storagePath = `video/${file}`;
            const fileBuffer = fs.readFileSync(compressedPath);

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
        } catch (error: any) {
            console.error(`Failed to process ${file}`, error.message);
        }
    }
    console.log('Compression and upload process complete!');
}

processMissingMedia().then(() => {
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
