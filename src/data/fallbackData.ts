import { FloorCategory, NavItem } from '../types';

export const FALLBACK_FLOORS: FloorCategory[] = [
    {
        id: 'floor-6',
        floor: '6F',
        title: { ko: '로컬 헤리티지', en: 'LOCAL HERITAGE' },
        description: { ko: '서울의 전경이 빌딩 숲 사이로 펼쳐지는 루프탑 가든과 글로벌 문화 교류를 위한 라운지입니다.', en: 'A rooftop garden with city views and a lounge for global cultural exchange.' },
        bgImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2560&auto=format&fit=crop',
        videoUrl: '/video/festival.mp4',
        color: '#2C3E50',
        content: [],
        subitems: [
            { id: 'heritage', label: { ko: '지역 문화 유산', en: 'Local Heritage' } },
            { id: 'travel', label: { ko: '전략적 앵커', en: 'Strategic Anchor' } },
            { id: 'f6_gourmet', label: { ko: '미식 아카이브', en: 'Gourmet Archive' } },
            { id: 'f6_craft', label: { ko: '지역 공예관', en: 'Local Craft' } },
            { id: 'f6_tour', label: { ko: '헤리티지 투어', en: 'Heritage Tour' } }
        ]
    },
    {
        id: 'floor-5',
        floor: '5F',
        title: { ko: '패션 아카이브', en: 'FASHION ARCHIVE' },
        description: { ko: '도심 속에서 진정한 휴식과 건강을 찾는 공간입니다. 자연에서 온 소재들로 꾸며진 웰니스 존입니다.', en: 'A space for true relaxation and health in the city, themed with natural materials.' },
        bgImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2560&auto=format&fit=crop',
        videoUrl: '/video/modern_tradition.mp4',
        color: '#1A5F7A',
        content: [],
        subitems: [
            { id: 'archive', label: { ko: '패션 아카이브', en: 'Fashion Archive' } },
            { id: 'collection', label: { ko: '시즌 컬렉션', en: 'Season Collection' } },
            { id: 'f5_material', label: { ko: '소재 도서관', en: 'Material Library' } },
            { id: 'f5_fitting', label: { ko: '피팅 스튜디오', en: 'Fitting Studio' } },
            { id: 'f5_textile', label: { ko: '텍스타일 룸', en: 'Textile Room' } }
        ]
    },
    {
        id: 'floor-4',
        floor: '4F',
        title: { ko: '컬처 토크', en: 'CULTURE TALK' },
        description: { ko: '한국 전역의 엄선된 로컬 식재료와 장인의 손길이 닿은 미식의 세계를 경험해보세요.', en: 'Experience the world of gourmet food with selected local ingredients and artisan touches.' },
        bgImage: 'https://images.unsplash.com/photo-1543431690-3b6be2c3cb19?q=80&w=2560&auto=format&fit=crop',
        videoUrl: '/video/travel.mp4',
        color: '#944E63',
        content: [],
        subitems: [
            { id: 'talk', label: { ko: '문화 담론', en: 'Cultural Talk' } },
            { id: 'interview', label: { ko: '아티스트 인터뷰', en: 'Artist Interview' } },
            { id: 'f4_plus', label: { ko: '토크 플러스', en: 'Talk Plus' } },
            { id: 'f4_book', label: { ko: '도서관 섹션', en: 'Book Section' } },
            { id: 'f4_seminar', label: { ko: '세미나 룸', en: 'Seminar Room' } }
        ]
    },
    {
        id: 'floor-3',
        floor: '3F',
        title: { ko: '라이프스타일 큐레이션', en: 'LIFESTYLE CURATION' },
        description: { ko: '예술과 사람이 만나는 곳. 다양한 워크숍과 전시를 통해 새로운 커뮤니티가 형성됩니다.', en: 'Where art meets people. New communities are formed through various workshops and exhibitions.' },
        bgImage: 'https://images.unsplash.com/photo-1517260739337-6799d239ce83?q=80&w=2560&auto=format&fit=crop',
        videoUrl: '/video/active.mp4',
        color: '#435334',
        content: [],
        subitems: [
            { id: 'performance', label: { ko: '공연 실황', en: 'Live Performance' } },
            { id: 'exhibit', label: { ko: '가상 전시', en: 'Virtual Exhibit' } },
            { id: 'f3_media', label: { ko: '미디어 아트 홀', en: 'Media Art Hall' } },
            { id: 'f3_lounge', label: { ko: '아티스트 라운지', en: 'Artist Lounge' } },
            { id: 'f3_audio', label: { ko: '사운드 아카이브', en: 'Sound Archive' } }
        ]
    },
    {
        id: 'floor-2',
        floor: '2F',
        title: { ko: '미디어 룸', en: 'MEDIA ROOM' },
        description: { ko: '가장 트렌디한 K-라이프스타일을 제안합니다. 현대적인 감각의 로컬 브랜드들을 소개합니다.', en: 'Suggesting the trendiest K-lifestyle and introducing modern local brands.' },
        bgImage: 'https://images.unsplash.com/photo-1596120364993-90dcc247f07e?q=80&w=2560&auto=format&fit=crop',
        videoUrl: '/video/trend.mp4',
        color: '#862B0D',
        content: [],
        subitems: [
            { id: 'sync', label: { ko: '시너지 공간', en: 'Synergy Space' } },
            { id: 'pop', label: { ko: '다이내믹 팝업', en: 'Dynamic Pop-up' } },
            { id: 'f2_lab', label: { ko: '브랜드 랩', en: 'Brand Lab' } },
            { id: 'f2_art', label: { ko: '아트 콜라보', en: 'Art Collab' } },
            { id: 'f2_gallery', label: { ko: '한정판 갤러리', en: 'Limited Gallery' } }
        ]
    },
    {
        id: 'floor-1',
        floor: '1F',
        title: { ko: 'K-컬처 트렌드', en: 'K-CULTURE TRENDS' },
        description: { ko: '한국의 아름다운 전통과 현대 예술이 조화를 이루는 프리미엄 갤러리입니다.', en: 'A premium gallery where beautiful Korean tradition harmonizes with modern art.' },
        bgImage: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=2560&auto=format&fit=crop',
        videoUrl: '/video/k-culture.mp4',
        color: '#4B3621',
        content: [],
        subitems: [
            { id: 'global', label: { ko: '글로벌 트렌드', en: 'Global Trend' } },
            { id: 'window', label: { ko: '디지털 쇼윈도', en: 'Digital Window' } },
            { id: 'f1_kpop', label: { ko: 'K-팝 스테이지', en: 'K-Pop Stage' } },
            { id: 'f1_library', label: { ko: '트렌드 라이브러리', en: 'Trend Library' } },
            { id: 'f1_tech', label: { ko: '한류 테크존', en: 'K-Tech Zone' } }
        ]
    }
];

export const FALLBACK_NAV: NavItem[] = [
    {
        id: 'floors',
        href: '/inspiration',
        subitems: FALLBACK_FLOORS.map(f => ({
            id: f.id,
            label: (typeof f.title === 'string' ? f.title : f.title.ko) || f.floor,
            href: `/detail/${f.id}`
        }))
    },
    {
        id: 'about',
        href: '/about'
    },
    {
        id: 'notice',
        href: '/notice'
    },
    {
        id: 'faq',
        href: '/faq'
    }
];

export const FALLBACK_PRODUCTS: any[] = [
    // 6F Local Heritage
    { id: 'p6-1', subcategory: 'heritage', category: 'floor-6', title: { ko: '경복궁 근정전 축소 모형', en: 'Gyeongbokgung Geunjeongjeon Scale Model' }, description: { ko: '정교한 세공으로 완성된 조선 왕실 건축의 정수입니다.', en: 'The essence of Joseon royal architecture completed with exquisite craftsmanship.' }, image_url: 'https://images.unsplash.com/photo-1590603740183-980e7f6920eb?q=80&w=2000', price: '2,500,000₩' },
    { id: 'p6-2', subcategory: 'travel', category: 'floor-6', title: { ko: '서울 골목길 가상 투어 패키지', en: 'Seoul Alleyway Virtual Tour Package' }, description: { ko: '숨겨진 서울의 매력을 VR로 탐험하는 프리미엄 투어입니다.', en: 'A premium VR tour exploring the hidden charms of Seoul.' }, image_url: 'https://images.unsplash.com/photo-1570160243111-20986506d87e?q=80&w=2000', price: '45,000₩' },
    { id: 'p6-3', subcategory: 'f6_gourmet', category: 'floor-6', title: { ko: '궁중 다과 한정판 세트', en: 'Royal Tea & Sweets Limited Set' }, description: { ko: '천년의 역사를 담은 명인의 손길로 빚은 다과 세트입니다.', en: 'A tea and sweets set crafted by a master with a thousand years of history.' }, image_url: 'https://images.unsplash.com/photo-1544787210-282ce92ec87c?q=80&w=2000', price: '85,000₩' },
    { id: 'p6-4', subcategory: 'f6_craft', category: 'floor-6', title: { ko: '방짜유기 장인 식기 세트', en: 'Hand-forged Bronzeware Tableware Set' }, description: { ko: '은은한 광택과 살균 효과가 탁월한 한국 전통 식기입니다.', en: 'Traditional Korean tableware with a subtle luster and excellent sterilization effects.' }, image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2000', price: '580,000₩' },
    { id: 'p6-5', subcategory: 'f6_tour', category: 'floor-6', title: { ko: '한양도성 달빛 탐방권', en: 'Hanyangdoseong Moonlight Exploration Pass' }, description: { ko: '성곽길을 따라 걷는 로맨틱한 야경 투어 프로그램입니다.', en: 'A romantic night tour program walking along the fortress walls.' }, image_url: 'https://images.unsplash.com/photo-1538669715515-5839b2361093?q=80&w=2000', price: '30,000₩' },

    // 5F Fashion Archive
    { id: 'p5-1', subcategory: 'archive', category: 'floor-5', title: { ko: '1970년대 명동 패션 아카이브 코트', en: '1970s Myeongdong Fashion Archive Coat' }, description: { ko: '한국 패션의 황금기를 재조명한 복각 시리즈입니다.', en: 'A replica series re-illuminating the golden age of Korean fashion.' }, image_url: 'https://images.unsplash.com/photo-1544062677-99ce54057602?q=80&w=2000', price: '620,000₩' },
    { id: 'p5-2', subcategory: 'collection', category: 'floor-5', title: { ko: '뉴 제네레이션 캡슐 컬렉션', en: 'New Generation Capsule Collection' }, description: { ko: '라이징 디자이너들이 제안하는 이번 시즌 핵심 아이템입니다.', en: 'Key items of this season suggested by rising designers.' }, image_url: 'https://images.unsplash.com/photo-1539109132314-d49c02d21295?q=80&w=2000', price: '290,000₩' },
    { id: 'p5-3', subcategory: 'f5_material', category: 'floor-5', title: { ko: '특수 가공 한지 섬유 샘플러', en: 'Specially Processed Hanji Fiber Sampler' }, description: { ko: '친환경적이며 통기성이 뛰어난 혁신 소재입니다.', en: 'An innovative material that is eco-friendly and highly breathable.' }, image_url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=2000', price: '15,000₩' },
    { id: 'p5-4', subcategory: 'f5_fitting', category: 'floor-5', title: { ko: '3D 스마트 피팅 서비스권', en: '3D Smart Fitting Service Pass' }, description: { ko: '정밀 스캔을 통한 완벽한 핏의 맞춤복 솔루션입니다.', en: 'A custom clothing solution with a perfect fit through precision scanning.' }, image_url: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=2000', price: '120,000₩' },

    // 4F Culture Talk
    { id: 'p4-1', subcategory: 'talk', category: 'floor-4', title: { ko: '명사 초청 문화 담론 티켓', en: 'VIP Cultural Discourse Ticket' }, description: { ko: '당대 최고의 지성들과 나누는 깊이 있는 대화입니다.', en: 'In-depth conversations with the greatest minds of our time.' }, image_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2000', price: '50,000₩' },
    { id: 'p4-2', subcategory: 'interview', category: 'floor-4', title: { ko: '아티스트 인터뷰 영상 아카이브', en: 'Artist Interview Video Archive' }, description: { ko: '작가의 철학을 날것 그대로 담아낸 독점 인터뷰입니다.', en: 'Exclusive interviews capturing the artist\'s philosophy in its raw form.' }, image_url: 'https://images.unsplash.com/photo-1473396413399-6717ef7c4093?q=80&w=2000', price: '15,000₩' },
    { id: 'p4-3', subcategory: 'f4_book', category: 'floor-4', title: { ko: '디자인 총서 화보집', en: 'Design Series Art Book' }, description: { ko: '수동적 독서를 넘어 영감을 주는 시각 예술 도서입니다.', en: 'A visual art book that goes beyond passive reading and provides inspiration.' }, image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2000', price: '95,000₩' },

    // 3F Lifestyle Curation
    { id: 'p3-1', subcategory: 'performance', category: 'floor-3', title: { ko: '미디어 융합 실감 공연 티켓', en: 'Media Convergence Immersive Performance Ticket' }, description: { ko: '무대와 기술이 하나되는 압도적 공연의 순간입니다.', en: 'A moment of overwhelming performance where the stage and technology become one.' }, image_url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2000', price: '110,000₩' },
    { id: 'p3-2', subcategory: 'exhibit', category: 'floor-3', title: { ko: '디지털 캔버스 아트 워크', en: 'Digital Canvas Art Work' }, description: { ko: '공간의 분위기를 실시간으로 변화시키는 예술 경험입니다.', en: 'An art experience that changes the atmosphere of a space in real time.' }, image_url: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?q=80&w=2000', price: '850,000₩' },
    { id: 'p3-3', subcategory: 'f3_media', category: 'floor-3', title: { ko: '홀로그램 이머시브 전시 관람권', en: 'Hologram Immersive Exhibition Ticket' }, description: { ko: '빛으로 구현된 가상 세계를 직접 체험해보세요.', en: 'Experience a virtual world implemented with light.' }, image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000', price: '25,000₩' },

    // 2F Media Room
    { id: 'p2-1', subcategory: 'sync', category: 'floor-2', title: { ko: '시너지 협업 도킹 스테이션', en: 'Synergy Collaboration Docking Station' }, description: { ko: '창의적인 연결을 위해 설계된 하이브리드 워크 디바이스입니다.', en: 'A hybrid work device designed for creative connection.' }, image_url: 'https://images.unsplash.com/photo-1526738549149-8e07eca2c547?q=80&w=2000', price: '320,000₩' },
    { id: 'p2-2', subcategory: 'pop', category: 'floor-2', title: { ko: '카라이네 한정판 피규어 세트', en: 'Karaine Limited Edition Figure Set' }, description: { ko: '전 세계 100세트 한정 제작된 캐릭터 컬렉터블입니다.', en: 'Character collectibles limited to 100 sets worldwide.' }, image_url: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=2000', price: '450,000₩' },
    { id: 'p2-3', subcategory: 'f2_art', category: 'floor-2', title: { ko: '스트릿 아티스트 콜라보 스니커즈', en: 'Street Artist Collab Sneakers' }, description: { ko: '거리의 에너지를 담은 대담한 디자인의 스니커즈입니다.', en: 'Sneakers with a bold design containing the energy of the street.' }, image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2000', price: '249,000₩' },

    // 1F K-Culture Trends
    { id: 'p1-1', subcategory: 'global', category: 'floor-1', title: { ko: 'K-POP 월드 투어 글로벌 공식 굿즈', en: 'K-POP World Tour Global Official Goods' }, description: { ko: '글로벌 팬덤을 위한 리미티드 패키지입니다.', en: 'A limited package for the global fandom.' }, image_url: 'https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=2000', price: '75,000₩' },
    { id: 'p1-2', subcategory: 'window', category: 'floor-1', title: { ko: '스마트 시티 홀로그램 키트', en: 'Smart City Hologram Kit' }, description: { ko: '내 손안의 작은 서울을 구현하는 테크 키트입니다.', en: 'A tech kit that implements a small Seoul in your hands.' }, image_url: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=2000', price: '129,000₩' },
    { id: 'p1-3', subcategory: 'f1_kpop', category: 'floor-1', title: { ko: '가상 아이돌 데뷔 앨범 컨셉 아트', en: 'Virtual Idol Debut Album Concept Art' }, description: { ko: '가상 세계의 스타를 현실로 소환하는 아트 컬렉션입니다.', en: 'An art collection that summons stars from the virtual world to reality.' }, image_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2000', price: '55,000₩' }
];

export const FALLBACK_STORIES: any[] = [
    { id: 's6-1', subcategory: 'heritage', title: '잊혀진 궁궐의 노래', content: '서울의 중심에서 잠자고 있던 옛 이야기들을 현대적으로 발굴해냅니다.', image_url: 'https://images.unsplash.com/photo-1548115184-bc62e3d5a55b?q=80&w=2000' },
    { id: 's5-1', subcategory: 'archive', title: '실을 잣는 마음', content: '전통 섬유 소재가 현대 패션의 주역이 되기까지의 긴 여정을 담았습니다.', image_url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=2000' },
    { id: 's4-1', subcategory: 'talk', title: '목소리의 파동', content: '담론과 대화가 어떻게 세상을 바꾸는지 작가들의 목소리로 들어봅니다.', image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000' },
    { id: 's3-1', subcategory: 'performance', title: '무대의 확장', content: '공연이 끝난 후에도 남는 여운, 그 이상의 감동을 가공공간에서 이어갑니다.', image_url: 'https://images.unsplash.com/photo-1514525253361-bee243870eb2?q=80&w=2000' },
    { id: 's2-1', subcategory: 'sync', title: '초연결의 일상', content: '기술과 사람이 만나는 접점에서 발생하는 새로운 시너지를 탐구합니다.', image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000' },
    { id: 's1-1', subcategory: 'global', title: 'K-웨이브의 근원', content: '한국 문화가 전 세계를 매료시킨 이유, 그 저변의 트렌드를 분석합니다.', image_url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2000' }
];
