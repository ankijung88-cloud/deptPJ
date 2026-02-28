import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const videoDir = path.join(projectRoot, 'public', 'video');

// 파일 크기가 너무 큰 비디오 파일 목록
const targetFiles = [
    'festival.mp4',
    'popup_store.mp4',
    'trand.mp4',
    'experience.mp4',
    'travel.mp4'
];

function compressExtremely(inputPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        console.log(`\n압축 시작: ${path.basename(inputPath)}...`);
        const startTime = Date.now();

        (ffmpeg as any)(inputPath)
            .outputOptions([
                '-crf 32',              // 압축률을 극대화 (숫자가 높을수록 화질 저하, 용량 감소. 웹 히어로 영상이므로 높은 압축)
                '-preset veryfast',     // 매우 빠른 인코딩 (시간 단축)
                '-vcodec libx264',
                '-acodec aac',
                '-b:a 64k',             // 오디오 비트레이트 최소화
                '-vf scale=-2:720',     // 해상도를 720p 픽셀로 제한
                '-movflags +faststart'  // 웹 스트리밍 최적화
            ])
            .on('end', () => {
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`성공: ${path.basename(inputPath)} 압축 완료 (${duration}초)`);
                resolve(outputPath);
            })
            .on('error', (err: any) => {
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
            // 이미 백업 파일이 있다면, 이미 압축된 적이 있는 파일일 수 있으므로 백업에서 원본 복원 후 재압축
            if (!fs.existsSync(backupPath)) {
                console.log(`${file} 백업 생성 중...`);
                fs.copyFileSync(inputPath, backupPath);
            } else {
                console.log(`${file} 원본을 백업 파일에서 복원 중...`);
                fs.copyFileSync(backupPath, inputPath);
            }

            const originalSize = fs.statSync(inputPath).size / (1024 * 1024);
            console.log(`${file} 원본 크기: ${originalSize.toFixed(2)} MB`);

            await compressExtremely(inputPath, outputPath);

            const compressedSize = fs.statSync(outputPath).size / (1024 * 1024);
            console.log(`${file} 압축 후 크기: ${compressedSize.toFixed(2)} MB`);
            const ratio = ((1 - (compressedSize / originalSize)) * 100).toFixed(1);
            console.log(`용량 감소율: ${ratio}%\n`);

            // 압축된 파일로 원본 교체
            fs.unlinkSync(inputPath);
            fs.renameSync(outputPath, inputPath);

        } catch (error) {
            console.error(`${file} 처리 실패:`, error);
        }
    }

    console.log('----- 모든 압축 작업 완료 -----');
}

startCompression();
