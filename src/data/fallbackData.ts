import { FloorCategory, Notice, FAQ, StaticPage } from '../types';

export const FALLBACK_FLOORS: FloorCategory[] = [
    {
        id: 'floor-7',
        floor: '7F',
        title: { ko: '커뮤니케이션 라운지', en: 'COMMUNICATION LOUNGE' },
        description: { ko: '실시간 가상 회의와 아바타 기반의 소통이 이루어지는 협업 공간입니다.', en: 'A collaborative space for real-time virtual meetings and avatar-based communication.' },
        videoUrl: '/uploads/meeting_room.mp4',
        color: '#FF3B30',
        content: [],
        subitems: [
            { id: 'meeting-room', label: { ko: '회의실', en: 'Meeting Room' } },
            { id: 'audio-room', label: { ko: '오디오룸', en: 'Audio Room' } },
            { id: 'interview-room', label: { ko: '면접실', en: 'Interview Room' } },
            { id: 'square', label: { ko: '모두의 광장', en: 'Square' } },
            { id: 'office', label: { ko: '오피스', en: 'Office' } }
        ]
    },
    {
        id: 'floor-6',
        floor: '6F',
        title: { ko: '게더 몰', en: 'GATHER MALL' },
        description: { ko: '글로벌 문화 교류와 상업 활동이 어우러지는 가상 복합 쇼핑몰입니다.', en: 'A virtual complex mall where global cultural exchange and commercial activities blend.' },
        videoUrl: '/uploads/travel.mp4',
        color: '#FF4757',
        content: [],
        subitems: [
            { id: 'b2b-mall', label: { ko: 'B2B 몰', en: 'B2B Mall' } },
            { id: 'f4_seminar', label: { ko: '세미나 룸', en: 'Seminar Room' } },
            { id: 'b2c-mall', label: { ko: 'B2C 몰', en: 'B2C Mall' } }
        ]
    },
    {
        id: 'floor-5',
        floor: '5F',
        title: { ko: '패션 아카이브', en: 'FASHION ARCHIVE' },
        description: { ko: '한국 패션사의 과거와 현재를 한눈에 볼 수 있는 디지털 전시관입니다.', en: 'A digital exhibition hall showcasing the past and present of Korean fashion history.' },
        videoUrl: '/uploads/modern_tradition.mp4',
        color: '#00D2FF',
        content: [],
        subitems: [
            { id: 'archive', label: { ko: '패션 아카이브', en: 'Fashion Archive' } },
            { id: 'collection', label: { ko: '시즌 컬렉션', en: 'Season Collection' } },
            { id: 'f5_fitting', label: { ko: '피팅 스튜디오', en: 'Fitting Studio' } }
        ]
    },
    {
        id: 'floor-4',
        floor: '4F',
        title: { ko: '로컬 헤리티지', en: 'LOCAL HERITAGE' },
        description: { ko: '한국 전역의 엄선된 로컬 브랜드와 장인의 손길이 닿은 예술품을 만나보세요.', en: 'Meet selected local brands and artisan crafts from all over Korea.' },
        videoUrl: '/uploads/festival.mp4',
        color: '#00A8FF',
        content: [],
        subitems: [
            { id: 'heritage', label: { ko: '지역 문화 유산', en: 'Local Heritage' } },
            { id: 'f6_gourmet', label: { ko: '미식 아카이브', en: 'Gourmet Archive' } },
            { id: 'f6_craft', label: { ko: '지역 공예관', en: 'Local Craft' } },
            { id: 'shaman', label: { ko: '무속신당', en: 'Shamanic Shrine' } },
            { id: 'saju', label: { ko: '사주상담소', en: 'Saju Reading' } }
        ]
    },
    {
        id: 'floor-3',
        floor: '3F',
        title: { ko: '라이프스타일 큐레이션', en: 'LIFESTYLE CURATION' },
        description: { ko: '예술과 사람이 소통하는 곳. 다양한 워크숍과 전시가 열립니다.', en: 'Where art and people communicate. Various workshops and exhibitions are held.' },
        videoUrl: '/uploads/active.mp4',
        color: '#2ECC71',
        content: [],
        subitems: [
            { id: 'performance', label: { ko: '공연 실황', en: 'Live Performance' } },
            { id: 'exhibit', label: { ko: '가상 전시', en: 'Virtual Exhibit' } },
            { id: 'movement', label: { ko: '무브먼트 아카이브', en: 'Movement Archive' } }
        ]
    },
    {
        id: 'floor-2',
        floor: '2F',
        title: { ko: '뷰티 앤 케어', en: 'BEAUTY & CARE' },
        description: { ko: '자신만의 아름다움을 완성하는 고품격 뷰티 큐레이션 공간입니다.', en: 'A high-end beauty curation space to complete your own beauty.' },
        videoUrl: '/uploads/trend.mp4',
        color: '#F39C12',
        content: [],
        subitems: [
            { id: 'skincare', label: { ko: '스킨케어', en: 'Skincare' } },
            { id: 'hair', label: { ko: '헤어케어', en: 'Hair Care' } },
            { id: 'p_surgery', label: { ko: '뷰티성형', en: 'Plastic Surgery' } },
            { id: 'inner-beauty', label: { ko: '이너뷰티', en: 'Inner Beauty' } },
            { id: 'body-care', label: { ko: '바디케어', en: 'Body Care' } }
        ]
    },
    {
        id: 'floor-tech-care',
        floor: '1F',
        title: { ko: '테크 앤 케어', en: 'TECH & CARE' },
        description: { ko: '자동차 기술의 혁신과 스마트 라이프스타일이 만나는 미래형 공간입니다.', en: 'A futuristic space where automotive innovation meets smart lifestyle.' },
        videoUrl: '/uploads/k-culture.mp4',
        color: '#FFD32A',
        content: [],
        subitems: [
            { id: 'car-care', label: { ko: 'CAR 케어', en: 'CAR Care' } },
            { id: 'f1_tech', label: { ko: '한류 테크존', en: 'K-Tech Zone' } }
        ]
    }
];

export const FALLBACK_PARTNERS = [
    { name: 'Studio Aether', industry: 'Architecture & Design' },
    { name: 'Nexus Digital', industry: 'Creative Agency' },
    { name: 'Vertex Labs', industry: '3D Visualization' },
    { name: 'Heritage Works', industry: 'Cultural Curation' },
    { name: 'Oasis Space', industry: 'Virtual Real Estate' },
    { name: 'Lumina VR', industry: 'Immersive Tech' },
    { name: 'Arc & Core', industry: 'System Architecture' },
    { name: 'Visionary Meta', industry: 'Metaverse Consulting' },
    { name: 'Zenith Design', industry: 'Product Strategy' },
    { name: 'Nova Interactive', industry: 'Digital Experience' },
    { name: 'Prism Art', industry: 'Creative Direction' },
    { name: 'Ethereal Media', industry: 'Content Production' },
];

export const FALLBACK_PRODUCTS: any[] = [
    { id: 'p7-1', subcategory: 'meeting-room', category: 'floor-7', title: { ko: '스마트 스터디 룸 예약권', en: 'Smart Study Room Reservation' }, description: { ko: '최적의 몰입을 위한 프라이빗 스터디 공간입니다.', en: 'A private study space for optimal immersion.' }, image_url: '/via_station_logo_portal.png', price: '20,000₩' },
    { id: 'p4-1', subcategory: 'heritage', category: 'floor-4', title: { ko: '경복궁 근정전 축소 모형', en: 'Gyeongbokgung Geunjeongjeon Scale Model' }, description: { ko: '정교한 세공으로 완성된 조선 왕실 건축의 정수입니다.', en: 'The essence of Joseon royal architecture.' }, image_url: '/via_station_logo_portal.png', price: '2,500,000₩' },
    { id: 'p2-1', subcategory: 'skincare', category: 'floor-2', title: { ko: '프리미엄 밸런싱 세럼', en: 'Premium Balancing Serum' }, description: { ko: '피부 속 깊은 곳까지 수분을 채워주는 고농축 영양 세럼입니다.', en: 'A highly concentrated nourishing serum.' }, image_url: '/via_station_logo_portal.png', price: '120,000₩' }
];

export const FALLBACK_NOTICES: Notice[] = [
    {
        id: '1',
        title: { ko: '몽땅쏙 그랜드 오픈 안내', en: 'Grand Opening Announcement' },
        category: '공지',
        date: '2024-03-01',
        content: { ko: '몽땅쏙이 정식 오픈하였습니다. 차별화된 가상 공간 서비스를 경험해보세요.', en: 'The 몽땅쏙 is officially open. Experience our unique virtual space service.' },
        is_important: true
    }
];

export const FALLBACK_FAQS: FAQ[] = [
    {
        id: '1',
        question: { ko: '몽땅쏙의 운영 시간은 어떻게 되나요?', en: 'What are the operating hours?' },
        answer: { ko: '오전 10시 30분부터 오후 8시까지 운영됩니다.', en: 'Open from 10:30 AM to 8:00 PM.' }
    }
];

export const FALLBACK_PAGES: StaticPage[] = [
    { id: 'page-home', title: { ko: '홈', en: 'Home' }, description: { ko: '몽땅쏙의 메인 페이지입니다.', en: 'The main page of 몽땅쏙.' }, url: '/' },
    { id: 'page-about', title: { ko: '소개', en: 'About' }, description: { ko: '몽땅쏙의 가치와 비전을 소개합니다.', en: 'Introducing values and vision.' }, url: '/about' }
];
