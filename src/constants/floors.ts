export const FLOORS = [
    {
        level: 6,
        title: 'LOCAL HERITAGE',
        label: '6F',
        color: '#FF3B30', // Red (South)
        videoUrl: '/uploads/festival.mp4',
        subcategories: [
            { id: 'heritage', label: '지역 문화 유산' },
            { id: 'travel', label: '전략적 앵커' },
            { id: 'f6_gourmet', label: '미식 아카이브' },
            { id: 'f6_craft', label: '지역 공예관' },
            { id: 'f6_tour', label: '헤리티지 투어' }
        ]
    },
    {
        level: 5,
        title: 'FASHION ARCHIVE',
        label: '5F',
        color: '#FFD700', // Yellow (Center)
        videoUrl: '/uploads/modern_tradition.mp4',
        subcategories: [
            { id: 'archive', label: '패션 아카이브' },
            { id: 'collection', label: '시즌 컬렉션' },
            { id: 'f5_material', label: '소재 도서관' },
            { id: 'f5_fitting', label: '피팅 스튜디오' },
            { id: 'f5_textile', label: '텍스타일 룸' }
        ]
    },
    {
        level: 4,
        title: 'GATHER MALL',
        label: '4F',
        color: '#F8FAFF', // White (West)
        videoUrl: '/uploads/travel.mp4',
        subcategories: [
            { id: 'b2b-mall', label: 'B2B 몰' },
            { id: 'interview', label: '아티스트 인터뷰' },
            { id: 'f4_plus', label: '토크 플러스' },
            { id: 'f4_book', label: '도서관 섹션' },
            { id: 'f4_seminar', label: '세미나 룸' }
        ]
    },
    {
        level: 3,
        title: 'LIFESTYLE CURATION',
        label: '3F',
        color: '#0070FF', // Blue (East)
        videoUrl: '/uploads/active.mp4',
        subcategories: [
            { id: 'performance', label: '공연 실황' },
            { id: 'exhibit', label: '가상 전시' },
            { id: 'f3_media', label: '미디어 아트 홀' },
            { id: 'f3_lounge', label: '아티스트 라운지' },
            { id: 'f3_audio', label: '사운드 아카이브' }
        ]
    },
    {
        level: 2,
        title: 'BEAUTY & CARE',
        label: '2F',
        color: '#00FFC2', // Cyan/Green (East/Neo-Dancheong Mint)
        videoUrl: '/uploads/trend.mp4',
        subcategories: [
            { id: 'skincare', label: '스킨케어' },
            { id: 'hair', label: '헤어케어' },
            { id: 'perfume', label: '퍼퓸' },
            { id: 'inner-beauty', label: '이너 뷰티' },
            { id: 'body-care', label: '바디케어' }
        ]
    },
    {
        level: 1,
        title: 'TECH & CARE',
        label: '1F',
        color: '#0A0D17', // Black (North/Void Navy)
        videoUrl: '/uploads/k-culture.mp4',
        subcategories: [
            { id: 'car-care', label: 'CAR 케어' },
            { id: 'window', label: '디지털 쇼윈도' },
            { id: 'f1_kpop', label: 'K-팝 스테이지' },
            { id: 'f1_library', label: '트렌드 라이브러리' },
            { id: 'f1_tech', label: '한류 테크존' }
        ]
    },
];
