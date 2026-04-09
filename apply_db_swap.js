import pool from './server/config/db.js';
import { syncAll } from './server/utils/syncService.js';

async function performSwap() {
    try {
        console.log('[DB SWAP] Starting identity relocation...');

        // 1. Update floor-4 (To Local Heritage)
        // Values derived from current 6F state + new branding goals
        await pool.query(`
            UPDATE floor_categories 
            SET title = ?, description = ?, color = ?, video_url = ?, subitems = ?
            WHERE id = 'floor-4'
        `, [
            JSON.stringify({ ko: '로컬 헤리티지', en: 'LOCAL HERITAGE' }),
            JSON.stringify({ ko: '한국 전역의 엄선된 로컬 식재료와 장인의 손길이 닿은 미식의 세계를 경험해보세요.', en: 'Experience the world of gourmet food with selected local ingredients and artisan touches.' }),
            '#00A8FF',
            '/uploads/festival.mp4',
            JSON.stringify([
                { id: 'heritage', label: { ko: '지역 문화 유산', en: 'Local Heritage' } },
                { id: 'f6_gourmet', label: { ko: '미식 아카이브', en: 'Gourmet Archive' } },
                { id: 'f6_craft', label: { ko: '지역 공예관', en: 'Local Craft' } },
                { id: 'f6_tour', label: { ko: '헤리티지 투어', en: 'Heritage Tour' } }
            ])
        ]);

        // 2. Update floor-6 (To Gather Mall)
        // Values derived from current 4F state + new branding goals
        await pool.query(`
            UPDATE floor_categories 
            SET title = ?, description = ?, color = ?, video_url = ?, subitems = ?
            WHERE id = 'floor-6'
        `, [
            JSON.stringify({ ko: '게더 몰', en: 'GATHER MALL' }),
            JSON.stringify({ ko: '서울의 전경이 빌딩 숲 사이로 펼쳐지는 루프탑 가든과 글로벌 문화 교류를 위한 라운지입니다.', en: 'A rooftop garden with city views and a lounge for global cultural exchange.' }),
            '#FF4757',
            '/uploads/travel.mp4',
            JSON.stringify([
                { id: 'travel', label: { ko: '여행', en: 'Travel' } },
                { id: 'b2b-mall', label: { ko: 'B2B 몰', en: 'B2B Mall' } },
                { id: 'interview', label: { ko: '아티스트 인터뷰', en: 'Artist Interview' } },
                { id: 'f4_plus', label: { ko: '토크 플러스', en: 'Talk Plus' } },
                { id: 'f4_book', label: { ko: '도서관 섹션', en: 'Book Section' } },
                { id: 'f4_seminar', label: { ko: '세미나 룸', en: 'Seminar Room' } }
            ])
        ]);

        // 3. Delete redundant floor-gather-mall
        await pool.query('DELETE FROM floor_categories WHERE id = "floor-gather-mall"');

        console.log('[DB SWAP] DB records updated. Triggering Sync to Code...');
        
        // 4. Trigger Sync to source files (floors.ts, categories.json)
        await syncAll();

        console.log('[DB SWAP] ALL DONE. Identity swap completed across DB and Code.');
        process.exit(0);
    } catch (error) {
        console.error('[DB SWAP] FAILED:', error);
        process.exit(1);
    }
}

performSwap();
