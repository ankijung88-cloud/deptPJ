import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const videoDir = path.join(projectRoot, 'public', 'video');

const targetFiles = [
    'festival.mp4',
    'popup_store.mp4',
    'trand.mp4',
    'experience.mp4',
    'travel.mp4'
];

function compressExtremely(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`\n압축 시작: ${path.basename(inputPath)}...`);
        const startTime = Date.now();

        ffmpeg(inputPath)
            .outputOptions([
                '-crf 32',
                '-preset veryfast',
                '-vcodec libx264',
                '-acodec aac',
                '-b:a 64k',
                '-vf scale=-2:720',
                '-movflags +faststart'
            ])
            .on('end', () => {
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`성공: ${path.basename(inputPath)} 압축 완료 (${duration}초)`);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error(`에러: ${path.basename(inputPath)} 압축 중 오류 발생:`, err);
                reject(err);
            })
            .save(outputPath);
    });
}

async function startCompression() {
    for (const file of targetFiles) {
        const inputPath = path.join(videoDir, file);
        const backupPath = path.join(videoDir, `backup_${file}`);
        const outputPath = path.join(videoDir, `temp_${file}`);

        if (!fs.existsSync(inputPath)) {
            console.log(`건너뜀: ${file} 파일을 찾을 수 없습니다.`);
            continue;
        }

        try {
            if (!fs.existsSync(backupPath)) {
                console.log(`${file} 원본 백업 중...`);
                fs.copyFileSync(inputPath, backupPath);
            } else {
                console.log(`${file} 기존 백업을 원본으로 복원 중...`);
                fs.copyFileSync(backupPath, inputPath);
            }

            const originalSize = fs.statSync(inputPath).size / (1024 * 1024);
            console.log(`${file} 원본 크기: ${originalSize.toFixed(2)} MB`);

            await compressExtremely(inputPath, outputPath);

            const compressedSize = fs.statSync(outputPath).size / (1024 * 1024);
            console.log(`${file} 압축 후 크기: ${compressedSize.toFixed(2)} MB`);
            const ratio = ((1 - (compressedSize / originalSize)) * 100).toFixed(1);
            console.log(`용량 감소율: ${ratio}%\n`);

            fs.unlinkSync(inputPath);
            fs.renameSync(outputPath, inputPath);

        } catch (error) {
            console.error(`${file} 처리 실패:`, error);
        }
    }

    console.log('----- 모든 압축 작업 완료 -----');
}

startCompression();
