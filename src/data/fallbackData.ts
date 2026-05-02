import { FloorCategory, Notice, FAQ, StaticPage } from '../types';

export const FALLBACK_FLOORS: FloorCategory[] = [
    {
        id: 'floor-6',
        floor: '6F',
        title: { ko: '그로스 마켓', en: 'Growth Market' },
        description: { ko: '공동구매와 프리오더를 통해 새로운 가치를 발견하는 시장입니다.', en: 'A market where you discover new values through group purchases and pre-orders.' },
        color: '#E74C3C'
    },
    {
        id: 'floor-5',
        floor: '5F',
        title: { ko: '노마드 워크플레이', en: 'Nomad Workplay' },
        description: { ko: '일하고, 즐기며, 나누는 일상이 영감이 되는 공간입니다.', en: 'A space where working, enjoying, and sharing daily life becomes inspiration.' },
        color: '#00D2FF'
    },
    {
        id: 'floor-4',
        floor: '4F',
        title: { ko: '로컬 헤리티지', en: 'Local Heritage' },
        description: { ko: '지역의 숨결이 담긴 문화 유산과 미식을 경험해보세요.', en: 'Experience cultural heritage and gourmet food containing the breath of the region.' },
        color: '#00A8FF'
    },
    {
        id: 'floor-3',
        floor: '3F',
        title: { ko: '아트 디스커버리', en: 'Art Discovery' },
        description: { ko: '당신의 일상에 세상의 모든 아름다운 가치들을 얻을 수 있는 여정입니다.', en: 'A journey where you can obtain all the beautiful values of the world in your daily life.' },
        color: '#2ECC71'
    },
    {
        id: 'floor-2',
        floor: '2F',
        title: { ko: '뷰티 앤 패션', en: 'Beauty & Fashion' },
        description: { ko: '건강함과 당신의 정체성을 드러내는 패션을 한곳에서 만나보세요.', en: 'Meet health and fashion that reveals your identity in one place.' },
        color: '#F39C12'
    },
    {
        id: 'floor-1',
        floor: '1F',
        title: { ko: '테크 앤 케어', en: 'Tech & Care' },
        description: { ko: '일상의 품격을 높이는 스마트한 기술과 맞춤형 웰니스 공간입니다.', en: 'A smart technology and customized wellness space that enhances the quality of daily life.' },
        color: '#FFD32A'
    }
];

export const FALLBACK_NOTICES: Notice[] = [];

export const FALLBACK_FAQS: FAQ[] = [];

export const FALLBACK_PAGES: StaticPage[] = [];

export const FALLBACK_PRODUCTS: any[] = [];

export const FALLBACK_PARTNERS: any[] = [];
