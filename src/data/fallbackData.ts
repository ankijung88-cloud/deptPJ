import { FloorCategory, NavItem, Notice, FAQ } from '../types';

export const FALLBACK_FLOORS: FloorCategory[] = [
    {
        id: 'floor-6',
        floor: '6F',
        title: { ko: '로컬 헤리티지', en: 'LOCAL HERITAGE' },
        description: { ko: '서울의 전경이 빌딩 숲 사이로 펼쳐지는 루프탑 가든과 글로벌 문화 교류를 위한 라운지입니다.', en: 'A rooftop garden with city views and a lounge for global cultural exchange.' },
        videoUrl: '/uploads/festival.mp4',
        color: '#00A8FF', // 6F - Vibrant Blue (Heritage)
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
        videoUrl: '/uploads/modern_tradition.mp4',
        color: '#00D2FF', // 5F - Bright Cyan (Fashion/White-adjacent)
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
        id: 'floor-gather-mall',
        floor: '4F',
        title: { ko: '게더 몰', en: 'GATHER MALL' },
        description: { ko: '한국 전역의 엄선된 로컬 식재료와 장인의 손길이 닿은 미식의 세계를 경험해보세요.', en: 'Experience the world of gourmet food with selected local ingredients and artisan touches.' },
        videoUrl: '/uploads/travel.mp4',
        color: '#FF4757', // 4F - Vibrant Red (Culture)
        content: [],
        subitems: [
            { id: 'b2b-mall', label: { ko: 'B2B 몰', en: 'B2B Mall' } },
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
        videoUrl: '/uploads/active.mp4',
        color: '#2ECC71', // 3F - Emerald Green (Lifestyle)
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
        id: 'floor2',
        floor: '2F',
        title: { ko: '뷰티 앤 케어', en: 'BEAUTY & CARE' },
        description: { ko: '나만의 아름다움을 발견하고 완성하는 고품격 뷰티 큐레이션 공간입니다.', en: 'A premium beauty curation space where you discover and complete your own beauty.' },
        videoUrl: '/uploads/trend.mp4',
        color: '#F39C12', // 2F - Vibrant Orange/Marigold (Media)
        content: [],
        subitems: [
            { id: 'skincare', label: { ko: '스킨케어', en: 'Skincare' } },
            { id: 'hair', label: { ko: '헤어케어', en: 'Hair Care' } },
            { id: 'perfume', label: { ko: '퍼퓸', en: 'Perfume' } },
            { id: 'inner-beauty', label: { ko: '이너 뷰티', en: 'Inner Beauty' } },
            { id: 'body-care', label: { ko: '바디케어', en: 'Body Care' } }
        ]
    },
    {
        id: 'floor-tech-care',
        floor: '1F',
        title: { ko: '테크 앤 케어', en: 'TECH & CARE' },
        description: { ko: '자동차 기술의 혁신과 라이프스타일 케어가 만나는 미래형 공간입니다.', en: 'A futuristic space where automotive innovation meets lifestyle care.' },
        videoUrl: '/uploads/k-culture.mp4',
        color: '#FFD32A', // 1F - Sunny Yellow (Trends)
        content: [],
        subitems: [
            { id: 'car-care', label: { ko: 'CAR 케어', en: 'CAR Care' } },
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
    { id: 'p6-1', subcategory: 'heritage', category: 'floor-6', title: { ko: '경복궁 근정전 축소 모형', en: 'Gyeongbokgung Geunjeongjeon Scale Model' }, description: { ko: '정교한 세공으로 완성된 조선 왕실 건축의 정수입니다.', en: 'The essence of Joseon royal architecture completed with exquisite craftsmanship.' }, image_url: '/DEPT_Logo.png', price: '2,500,000₩' },
    { id: 'p6-2', subcategory: 'travel', category: 'floor-6', title: { ko: '서울 골목길 가상 투어 패키지', en: 'Seoul Alleyway Virtual Tour Package' }, description: { ko: '숨겨진 서울의 매력을 VR로 탐험하는 프리미엄 투어입니다.', en: 'A premium VR tour exploring the hidden charms of Seoul.' }, image_url: '/DEPT_Logo.png', price: '45,000₩' },
    { id: 'p6-3', subcategory: 'f6_gourmet', category: 'floor-6', title: { ko: '궁중 다과 한정판 세트', en: 'Royal Tea & Sweets Limited Set' }, description: { ko: '천년의 역사를 담은 명인의 손길로 빚은 다과 세트입니다.', en: 'A tea and sweets set crafted by a master with a thousand years of history.' }, image_url: '/DEPT_Logo.png', price: '85,000₩' },
    { id: 'p6-4', subcategory: 'f6_craft', category: 'floor-6', title: { ko: '방짜유기 장인 식기 세트', en: 'Hand-forged Bronzeware Tableware Set' }, description: { ko: '은은한 광택과 살균 효과가 탁월한 한국 전통 식기입니다.', en: 'Traditional Korean tableware with a subtle luster and excellent sterilization effects.' }, image_url: '/DEPT_Logo.png', price: '580,000₩' },
    { id: 'p6-5', subcategory: 'f6_tour', category: 'floor-6', title: { ko: '한양도성 달빛 탐방권', en: 'Hanyangdoseong Moonlight Exploration Pass' }, description: { ko: '성곽길을 따라 걷는 로맨틱한 야경 투어 프로그램입니다.', en: 'A romantic night tour program walking along the fortress walls.' }, image_url: '/DEPT_Logo.png', price: '30,000₩' },

    // 5F Fashion Archive
    { id: 'p5-1', subcategory: 'archive', category: 'floor-5', title: { ko: '1970년대 명동 패션 아카이브 코트', en: '1970s Myeongdong Fashion Archive Coat' }, description: { ko: '한국 패션의 황금기를 재조명한 복각 시리즈입니다.', en: 'A replica series re-illuminating the golden age of Korean fashion.' }, image_url: '/DEPT_Logo.png', price: '620,000₩' },
    { id: 'p5-2', subcategory: 'collection', category: 'floor-5', title: { ko: '뉴 제네레이션 캡슐 컬렉션', en: 'New Generation Capsule Collection' }, description: { ko: '라이징 디자이너들이 제안하는 이번 시즌 핵심 아이템입니다.', en: 'Key items of this season suggested by rising designers.' }, image_url: '/DEPT_Logo.png', price: '290,000₩' },
    { id: 'p5-3', subcategory: 'f5_material', category: 'floor-5', title: { ko: '특수 가공 한지 섬유 샘플러', en: 'Specially Processed Hanji Fiber Sampler' }, description: { ko: '친환경적이며 통기성이 뛰어난 혁신 소재입니다.', en: 'An innovative material that is eco-friendly and highly breathable.' }, image_url: '/DEPT_Logo.png', price: '15,000₩' },
    { id: 'p5-4', subcategory: 'f5_fitting', category: 'floor-5', title: { ko: '3D 스마트 피팅 서비스권', en: '3D Smart Fitting Service Pass' }, description: { ko: '정밀 스캔을 통한 완벽한 핏의 맞춤복 솔루션입니다.', en: 'A custom clothing solution with a perfect fit through precision scanning.' }, image_url: '/DEPT_Logo.png', price: '120,000₩' },

    // 4F Gather Mall
    { id: 'p4-1', subcategory: 'b2b-mall', category: 'floor-gather-mall', title: { ko: '명사 초청 문화 담론 티켓', en: 'VIP Cultural Discourse Ticket' }, description: { ko: '당대 최고의 지성들과 나누는 깊이 있는 대화입니다.', en: 'In-depth conversations with the greatest minds of our time.' }, image_url: '/DEPT_Logo.png', price: '50,000₩' },
    { id: 'p4-2', subcategory: 'interview', category: 'floor-gather-mall', title: { ko: '아티스트 인터뷰 영상 아카이브', en: 'Artist Interview Video Archive' }, description: { ko: '작가의 철학을 날것 그대로 담아낸 독점 인터뷰입니다.', en: 'Exclusive interviews capturing the artist\'s philosophy in its raw form.' }, image_url: '/DEPT_Logo.png', price: '15,000₩' },
    { id: 'p4-3', subcategory: 'f4_book', category: 'floor-gather-mall', title: { ko: '디자인 총서 화보집', en: 'Design Series Art Book' }, description: { ko: '수동적 독서를 넘어 영감을 주는 시각 예술 도서입니다.', en: 'A visual art book that goes beyond passive reading and provides inspiration.' }, image_url: '/DEPT_Logo.png', price: '95,000₩' },

    // 3F Lifestyle Curation
    { id: 'p3-1', subcategory: 'performance', category: 'floor-3', title: { ko: '미디어 융합 실감 공연 티켓', en: 'Media Convergence Immersive Performance Ticket' }, description: { ko: '무대와 기술이 하나되는 압도적 공연의 순간입니다.', en: 'A moment of overwhelming performance where the stage and technology become one.' }, image_url: '/DEPT_Logo.png', price: '110,000₩' },
    { id: 'p3-2', subcategory: 'exhibit', category: 'floor-3', title: { ko: '디지털 캔버스 아트 워크', en: 'Digital Canvas Art Work' }, description: { ko: '공간의 분위기를 실시간으로 변화시키는 예술 경험입니다.', en: 'An art experience that changes the atmosphere of a space in real time.' }, image_url: '/DEPT_Logo.png', price: '850,000₩' },
    { id: 'p3-3', subcategory: 'f3_media', category: 'floor-3', title: { ko: '홀로그램 이머시브 전시 관람권', en: 'Hologram Immersive Exhibition Ticket' }, description: { ko: '빛으로 구현된 가상 세계를 직접 체험해보세요.', en: 'Experience a virtual world implemented with light.' }, image_url: '/DEPT_Logo.png', price: '25,000₩' },

    // 2F Beauty & Care
    { id: 'p2-1', subcategory: 'skincare', category: 'floor2', title: { ko: '프리미엄 밸런싱 세럼', en: 'Premium Balancing Serum' }, description: { ko: '피부 속 깊은 곳까지 수분을 채워주는 고농축 영양 Serum입니다.', en: 'A highly concentrated nourishing serum that fills moisture deep into the skin.' }, image_url: '/DEPT_Logo.png', price: '120,000₩' },
    { id: 'p2-2', subcategory: 'hair', category: 'floor2', title: { ko: '실크 리페어 헤어 에센스', en: 'Silk Repair Hair Essence' }, description: { ko: '손상된 모발에 즉각적인 윤기와 부드러움을 부여하는 프로페셔널 헤어 케어입니다.', en: 'Professional hair care that gives instant shine and softness to damaged hair.' }, image_url: '/DEPT_Logo.png', price: '68,000₩' },
    { id: 'p2-3', subcategory: 'inner-beauty', category: 'floor2', title: { ko: '비타 부스트 콜라겐 앰플', en: 'Vita Boost Collagen Ampoule' }, description: { ko: '속부터 차오르는 생기를 위한 마시는 프리미엄 뷰티 솔루션입니다.', en: 'A drinking premium beauty solution for vitality from the inside out.' }, image_url: '/DEPT_Logo.png', price: '85,000₩' },

    // 1F Tech & Care
    { id: 'p1-1', subcategory: 'car-care', category: 'floor-tech-care', title: { ko: '프리미엄 세정 및 코팅 키트', en: 'Premium Washing & Coating Kit' }, description: { ko: '전문가의 손길을 집에서도 경험할 수 있는 하이엔드 카케어 세트입니다.', en: 'A high-end car care set to experience a professional touch at home.' }, image_url: '/DEPT_Logo.png', price: '75,000₩' },
    { id: 'p1-2', subcategory: 'window', category: 'floor-tech-care', title: { ko: '스마트 시티 홀로그램 키트', en: 'Smart City Hologram Kit' }, description: { ko: '내 손안의 작은 서울을 구현하는 테크 키트입니다.', en: 'A tech kit that implements a small Seoul in your hands.' }, image_url: '/DEPT_Logo.png', price: '129,000₩' },
    { id: 'p1-3', subcategory: 'f1_kpop', category: 'floor-tech-care', title: { ko: '가상 아이돌 데뷔 앨범 컨셉 아트', en: 'Virtual Idol Debut Album Concept Art' }, description: { ko: '가상 세계의 스타를 현실로 소환하는 아트 컬렉션입니다.', en: 'An art collection that summons stars from the virtual world to reality.' }, image_url: '/DEPT_Logo.png', price: '55,000₩' }
];

export const FALLBACK_STORIES: any[] = [
    { id: 's6-1', subcategory: 'heritage', title: '잊혀진 궁궐의 노래', content: '서울의 중심에서 잠자고 있던 옛 이야기들을 현대적으로 발굴해냅니다.', image_url: '/DEPT_Logo.png' },
    { id: 's5-1', subcategory: 'archive', title: '실을 잣는 마음', content: '전통 섬유 소재가 현대 패션의 주역이 되기까지의 긴 여정을 담았습니다.', image_url: '/DEPT_Logo.png' },
    { id: 's4-1', subcategory: 'b2b-mall', title: '목소리의 파동', content: '담론과 대화가 어떻게 세상을 바꾸는지 작가들의 목소리로 들어봅니다.', image_url: '/DEPT_Logo.png' },
    { id: 's3-1', subcategory: 'performance', title: '무대의 확장', content: '공연이 끝난 후에도 남는 여운, 그 이상의 감동을 가공공간에서 이어갑니다.', image_url: '/DEPT_Logo.png' },
    { id: 's2-1', subcategory: 'skincare', title: '아름다움의 본질을 찾아서', content: '스킨케어 기초부터 시작하는 건강한 피부 변화의 기록을 담았습니다.', image_url: '/DEPT_Logo.png' },
    { id: 's1-1', subcategory: 'car-care', title: '혁신적 디테일링의 세계', content: '자동차를 아끼는 마음에서 시작된 기술의 정점, 새로운 케어 패러다임을 제안합니다.', image_url: '/DEPT_Logo.png' }
];

export const FALLBACK_NOTICES: Notice[] = [
    {
        id: '1',
        title: { ko: '문화상점 그랜드 오픈 및 멤버십 혜택 안내', en: 'Grand Opening & Membership Benefits' },
        category: '공지',
        date: '2024-03-01',
        content: { ko: '문화상점이 정식 오픈하였습니다. 멤버십 가입 시 다양한 혜택을 드립니다.', en: 'The Culture Store is officially open. We offer various benefits for membership sign-ups.' },
        is_important: true
    },
    {
        id: '2',
        title: { ko: '봄 시즌 한정 예술품 입고 안내', en: 'Spring Season Limited Art Collection' },
        category: '전시',
        date: '2024-03-10',
        content: { ko: '따스한 봄을 맞아 엄선된 예술가들의 작품이 새롭게 입고되었습니다.', en: 'Selected artists\' works have been newly stocked in time for the warm spring.' },
        is_important: false
    },
    {
        id: '3',
        title: { ko: '지하 주차장 보수 공사 일정 안내', en: 'Parking Lot Maintenance Schedule' },
        category: '공지',
        date: '2024-03-15',
        content: { ko: '3월 25일부터 27일까지 주차장 일부 구역의 보수 공사가 진행됩니다.', en: 'Maintenance work will take place in some areas of the parking lot from March 25th to 27th.' },
        is_important: false
    }
];

export const FALLBACK_FAQS: FAQ[] = [
    {
        id: '1',
        question: { ko: '문화상점의 운영 시간은 어떻게 되나요?', en: 'What are the operating hours of the Culture Store?' },
        answer: { ko: '저희 문화상점은 연중무휴로 오전 10시 30분부터 오후 8시까지 운영됩니다. 다만, 특별 행사가 있는 경우 운영 시간이 조정될 수 있으니 공지사항을 확인해 주시기 바랍니다.', en: 'The Culture Store is open year-round from 10:30 AM to 8:00 PM. However, please check the notices as hours may change for special events.' }
    },
    {
        id: '2',
        question: { ko: '주차는 가능한가요?', en: 'Is parking available?' },
        answer: { ko: '네, 상점 건물 지하 1층부터 3층까지 넓은 주차 공간이 마련되어 있습니다. 상품 구매 고객께는 구매 금액에 따라 최대 4시간까지 무료 주차권을 제공해 드립니다.', en: 'Yes, a large parking space is available from the 1st to 3rd basement levels. Customers will receive a free parking ticket for up to 4 hours depending on the purchase amount.' }
    },
    {
        id: '3',
        question: { ko: '멤버십 혜택은 무엇인가요?', en: 'What are the membership benefits?' },
        answer: { ko: '문화상점 멤버십 회원이 되시면 모든 상품 구매 시 3% 포인트 적립, 생일 당일 10% 할인 쿠폰 발급, 그리고 시즌별 한정품 우선 구매권 등의 혜택을 누리실 수 있습니다.', en: 'Culture Store membership offers 3% point accumulation on all purchases, a 10% birthday discount coupon, and priority purchase rights for seasonal limited items.' }
    },
    {
        id: '4',
        question: { ko: '상품권 사용이 가능한가요?', en: 'Can I use gift certificates?' },
        answer: { ko: '네, 문화상품권, 백화점 상품권(신세계/롯데/현대) 및 문화상점 전용 디지털 기프트카드를 모두 사용하실 수 있습니다.', en: 'Yes, Culture Gift Certificates, Department Store Gift Certificates (Shinsegae/Lotte/Hyundai), and Culture Store-exclusive digital gift cards are all accepted.' }
    },
    {
        id: '5',
        question: { ko: '환불 및 교환 규정은 어떻게 되나요?', en: 'What is the refund and exchange policy?' },
        answer: { ko: '구매 후 7일 이내에 영수증과 미개봉 상태의 상품을 지참하시면 환불 및 교환이 가능합니다. 단, 일부 신선 제품이나 한정판 예술품의 경우 규정이 다를 수 있습니다.', en: 'Refunds and exchanges are possible within 7 days of purchase if you bring your receipt and unopened products. However, policies may differ for fresh products or limited-edition artworks.' }
    }
];

export const FALLBACK_PAGES = [
    { id: 'page-home', title: { ko: '홈', en: 'Home' }, description: { ko: '문화와 예술이 만나는 디지털 아카이브, 문화상점의 메인 페이지입니다.', en: 'The main page of Culture Store, a digital archive where culture and art meet.' }, url: '/' },
    { id: 'page-about', title: { ko: '소개', en: 'About' }, description: { ko: '문화상점의 가치와 비전, 그리고 우리가 만들어가는 문화 생태계에 대해 소개합니다.', en: 'Introducing the values, vision, and cultural ecosystem of the Culture Store.' }, url: '/about' },
    { id: 'page-notice', title: { ko: '공지사항', en: 'Notice' }, description: { ko: '문화상점의 새로운 소식과 주요 안내사항을 확인하실 수 있습니다.', en: 'Check out the new news and major announcements from the Culture Store.' }, url: '/notice' },
    { id: 'page-faq', title: { ko: '자주 묻는 질문', en: 'FAQ' }, description: { ko: '이용 방법, 주차, 멤버십 등 고객님들이 자주 궁금해하시는 질문들에 대한 답변입니다.', en: 'Answers to frequently asked questions about usage, parking, membership, etc.' }, url: '/faq' },
    { id: 'page-terms', title: { ko: '이용약관', en: 'Terms' }, description: { ko: '문화상점 서비스 이용을 위한 법적 권리와 의무 사항을 규정합니다.', en: 'Regulating legal rights and obligations for using the Culture Store service.' }, url: '/terms' },
    { id: 'page-privacy', title: { ko: '개인정보처리방침', en: 'Privacy' }, description: { ko: '고객님의 소중한 개인정보를 어떻게 보호하고 관리하는지 명시합니다.', en: 'Specifying how your valuable personal information is protected and managed.' }, url: '/privacy' },
    { id: 'page-inspiration', title: { ko: '영감의 공간 (트랜드)', en: 'Inspiration (Trend)' }, description: { ko: '1F부터 6F까지 각 층별 최신 트랜드 테마와 디지털 콘텐츠를 한눈에 둘러볼 수 있는 페이지입니다.', en: 'A page where you can browse the latest trend themes and digital content of each floor from 1F to 6F.' }, url: '/inspiration' },
];
