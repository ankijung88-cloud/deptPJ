import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const logFile = 'scripts/compression_log.txt';
function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
    console.log(msg);
}

log('Starting compression of trand.mp4...');

const inputPath = path.join(process.cwd(), 'public', 'video', 'trand.mp4');
const outputPath = path.join(process.cwd(), 'public', 'video', 'compressed_trand.mp4');

if (!fs.existsSync(inputPath)) {
    log('Input file not found: ' + inputPath);
    process.exit(1);
}

ffmpeg(inputPath)
    .outputOptions([
        '-crf 28',
        '-preset fast',
        '-vcodec libx264',
        '-acodec aac',
        '-b:a 128k',
        '-movflags +faststart'
    ])
    .on('progress', (progress) => {
        log(`Progress: ${progress.percent ? progress.percent.toFixed(2) : '0'}%`);
    })
    .on('end', () => {
        log('Successfully compressed trand.mp4');
        process.exit(0);
    })
    .on('error', (err) => {
        log('Error: ' + err.message);
        process.exit(1);
    })
    .save(outputPath);
