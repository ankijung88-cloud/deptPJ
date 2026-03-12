import { LiveShort } from '../types';

/**
 * LIVE_SHORTS is kept as a fallback for src/api/media.ts
 * when Supabase data fails to load.
 */
export const LIVE_SHORTS: LiveShort[] = [
    {
        id: 'short-1',
        title: { ko: '글로벌 K-컬처: 전통 무무 게릴라 공연', en: 'Global K-Culture: Tradition Dance Guerrilla', ja: '伝統舞踊ゲリラ公演', zh: '传统舞蹈快闪表演' },
        videoUrl: 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/k-culture.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1541535650810-10d26f597a65?auto=format&fit=crop&q=80',
        location: { ko: '1F 글로벌 K-컬처', en: '1F Central Plaza', ja: '1F 中央広場', zh: '1F 中央广场' },
        viewCount: 12500
    },
    {
        id: 'short-2',
        title: { ko: '모던 트래디션: 한복 런웨이 실황', en: 'Modern Tradition: Hanbok Runway', ja: 'モダン韓服ランウェイ', zh: '现代韩服秀' },
        videoUrl: 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/modern_tradition.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523805081326-8088f1c71e12?auto=format&fit=crop&q=80',
        location: { ko: '2F 콜라보레이션 & 팝업', en: '2F Fashion Hall', ja: '2F ファッションホール', zh: '2F 时尚大厅' },
        viewCount: 18200
    },
    {
        id: 'short-3',
        title: { ko: '트렌드 & 팝업: K-뷰티 워크숍', en: 'K-Beauty Trend Workshop', ja: 'K-Beauty ト레ンドワークショップ', zh: 'K-Beauty 趋势工作坊' },
        videoUrl: 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/trend.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80',
        location: { ko: '1F 디지털 쇼윈도', en: 'B1 Trend Area', ja: 'B1 ト레ンドエリア', zh: 'B1 趋势区' },
        viewCount: 15400
    },
    {
        id: 'short-4',
        title: { ko: '액티브 & 라이프: 태권도 모범 연무', en: 'Taekwondo Demonstration', ja: 'テコンドー模範演武', zh: '跆拳道表演' },
        videoUrl: 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/active.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80',
        location: { ko: '3F 퍼포먼스 & 전시', en: '3F Sports Zone', ja: '3F スポーツゾーン', zh: '3F 运动区' },
        viewCount: 21000
    },
    {
        id: 'short-5',
        title: { ko: '트래블 & 시티: 경복궁 가상 투어', en: 'Gyeongbokgung Palace Virtual Tour', ja: '景福宮バーチャルツアー', zh: '景福宫虚拟导览' },
        videoUrl: 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/travel.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540960309257-ecf91f3a53e4?auto=format&fit=crop&q=80',
        location: { ko: '4F 컬처 토크', en: '4F Gallery', ja: '4F ギャラリー', zh: '4F 画廊' },
        viewCount: 23500
    },
    {
        id: 'short-6',
        title: { ko: '디지털 아트 전시: 전통 문양의 재탄생', en: 'Traditional Patterns Digital Art', ja: '伝統模様デジタルアート', zh: '传统图案数字艺术' },
        videoUrl: 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/festival.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80',
        location: { ko: '3F 가상 갤러리', en: 'Media Art Hall', ja: 'メディアアートホール', zh: '媒体艺术厅' },
        viewCount: 31200
    }
];
