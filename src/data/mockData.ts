import { Artist, BrandSpotlight, CalendarEvent, FeaturedItem, FloorCategory, LiveShort, NavItem } from '../types';

export const NAV_ITEMS: NavItem[] = [
    {
        id: 'trend',
        href: '/trend',
        subitems: [
            { id: 'global', label: 'global_k_culture', href: '/trend?filter=global' },
            { id: 'heritage', label: 'modern_heritage', href: '/trend?filter=heritage' }
        ]
    },
    {
        id: 'popup',
        href: '/popup',
        subitems: [
            { id: 'exchange', label: 'exchange_booth', href: '/popup?filter=exchange' },
            { id: 'collab', label: 'collab_project', href: '/popup?filter=collab' }
        ]
    },
    {
        id: 'tickets',
        href: '/tickets',
        subitems: [
            { id: 'traditional', label: 'traditional_arts', href: '/tickets?filter=traditional' },
            { id: 'media', label: 'media_arts', href: '/tickets?filter=media' }
        ]
    },
    {
        id: 'style',
        href: '/style',
        subitems: [
            { id: 'class', label: 'culture_class', href: '/style?filter=class' },
            { id: 'kstyle', label: 'global_k_style', href: '/style?filter=kstyle' }
        ]
    },
    {
        id: 'travel',
        href: '/travel',
        subitems: [
            { id: 'local_heritage', label: 'local_heritage', href: '/travel?filter=local' },
            { id: 'travel_curation', label: 'travel_curation', href: '/travel?filter=course' }
        ]
    },
    {
        id: 'community',
        href: '/community',
        subitems: [
            { id: 'notice', label: 'notice', href: '/community?filter=notice' },
            { id: 'qna', label: 'qna', href: '/community?filter=qna' },
            { id: 'reviews', label: 'reviews', href: '/community?filter=reviews' }
        ]
    },
];

export const FLOOR_CATEGORIES: FloorCategory[] = [
    {
        id: 'trend',
        floor: '1F',
        title: {
            ko: '글로벌 K-컬처 / 교류',
            en: 'Global K-Culture / Exchange',
            ja: 'グローバルK-カルチャー / 交流',
            zh: '全球 K-Culture / 交流'
        },
        description: {
            ko: '세계를 잇는 K-컬처의 역동적인 에너지.',
            en: 'Dynamic energy of K-Culture connecting the world.',
            ja: '世界をつなぐK-カルチャーのダイ나믹한 에너지。',
            zh: '连接世界的 K-Culture 动态能量。'
        },
        bgImage: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=2560&auto=format&fit=crop',
        content: [
            {
                type: 'text',
                value: {
                    ko: '1층은 한국 문화의 현재를 세계와 공유하는 역동적인 교류의 장입니다. 글로벌 아티스트와의 협업, 국가 간 문화 교류 프로젝트를 통해 새로운 영감을 발견하세요.',
                    en: 'The 1st floor is a dynamic field of exchange sharing the present of Korean culture with the world. Discover new inspiration through collaborations with global artists and cross-national cultural exchange projects.',
                    ja: '1階は韓国文化の現在を世界と共有するダイナミックな交流の場です。グローバルアーティストとの協業、国家間の文化交流プロジェクトを通じて新しいインスピレーションを発見してください。',
                    zh: '1楼是与世界分享韩国文化现状的充满动态交流的场所。通过与全球艺术家的合作、国家间的文化交流项目发现新的灵感。'
                }
            }
        ],
        subitems: [
            { id: 'global', label: { ko: '글로벌 K-컬처', en: 'Global K-Culture', ja: 'グローバルK-カルチャー', zh: '全球 K-Culture' } },
            { id: 'exchange', label: { ko: '문화 교류', en: 'Cultural Exchange', ja: '文化交流', zh: '文化交流' } },
            { id: 'collab', label: { ko: '협업 프로젝트', en: 'Collaboration Project', ja: 'コラボプロジェクト', zh: '合作项目' } }
        ]
    },
    {
        id: 'tickets',
        floor: '2F',
        title: {
            ko: '전통 예술 / 아카이브',
            en: 'Traditional Arts / Archive',
            ja: '伝統芸術 / アーカイブ',
            zh: '传统艺术 / 档案'
        },
        description: {
            ko: '시간을 넘어 이어지는 고귀한 유산.',
            en: 'Noble heritage continuing across time.',
            ja: '時間を超えて続く高貴な遺産。',
            zh: '跨越时间流传的高贵遗产。'
        },
        bgImage: 'https://images.unsplash.com/photo-1543431690-3b6be2c3cb19?q=80&w=2560&auto=format&fit=crop',
        content: [
            {
                type: 'text',
                value: {
                    ko: '2층은 한국 예술의 정수를 보존하고 홍보하는 아카이브 공간입니다. 무형문화재의 디지털 기록물과 현대 미디어 기법으로 재 탄생한 전통 공연을 감상할 수 있습니다.',
                    en: 'The 2nd floor is an archive space aimed at preserving and promoting the essence of Korean arts. You can appreciate digital records of intangible cultural properties and traditional performances reborn with modern media techniques.',
                    ja: '2階は韓国芸術の精髄を保存し広めるアーカイブ空間です。無形文化財のデジタル記録物と現代メディア技法で再誕生した伝統公演を鑑賞することができます。',
                    zh: '2楼是保存和宣传韩国艺术精华的档案空间。可以欣赏到无形文化遗产的数字化记录和通过现代媒体技术重新诞生的传统演出。'
                }
            }
        ],
        subitems: [
            { id: 'traditional', label: { ko: '전통 예술', en: 'Traditional Arts', ja: '伝統芸術', zh: '传统艺术' } },
            { id: 'media', label: { ko: '미디어 아카이브', en: 'Media Archive', ja: 'メディアアーカイブ', zh: '媒体档案' } }
        ]
    },
    {
        id: 'art',
        floor: '3F',
        title: {
            ko: '문화 체험 / 클래스',
            en: 'Culture Experience / Class',
            ja: '文化体験 / クラス',
            zh: '文化体验 / 课程'
        },
        description: {
            ko: '손끝으로 느끼는 한국의 미.',
            en: 'Korean beauty at your fingertips.',
            ja: '指先で感じる韓国の美。',
            zh: '指尖感受到的韩国之美。'
        },
        bgImage: 'https://images.unsplash.com/photo-1517260739337-6799d239ce83?q=80&w=2560&auto=format&fit=crop',
        content: [
            {
                type: 'text',
                value: {
                    ko: '3층은 직접 경험하며 배우는 문화 교류 학교입니다. 전문가와 함께하는 다도, 서예, 공예 클래스를 통해 한국의 미를 깊이 있게 이해하고 자신의 감각을 더해보세요.',
                    en: 'The 3rd floor is a cultural exchange school to learn through direct experience. Deepen your understanding of Korean beauty through tea ceremony, calligraphy, and craft classes with experts.',
                    ja: '3階은 직접 경험하며 배우는 문화 교류 학교입니다. 전문가와 함께하는 다도, 서예, 공예 클래스를 통해 한국의 미를 깊이 있게 이해하고 자신의 감각을 더해보세요.',
                    zh: '3楼是通过亲自体验学习的文化交流学校。通过专家指导的茶道、书法、工艺课程，深入了解韩国之美并加入自己的感悟。'
                }
            }
        ],
        subitems: [
            { id: 'class', label: { ko: '문화 체험 클래스', en: 'Culture Class', ja: '文化体験クラス', zh: '文化体验课' } },
            { id: 'heritage', label: { ko: '전통 공예', en: 'Traditional Craft', ja: '伝統工芸', zh: '传统工艺' } }
        ]
    },
    {
        id: 'style',
        floor: '4F',
        title: {
            ko: 'K-스타일 / 시각 예술',
            en: 'K-Style / Visual Arts',
            ja: 'K-スタイル / 視覚芸術',
            zh: 'K-Style / 视觉艺术'
        },
        description: {
            ko: '현대적으로 재해석된 한국의 멋.',
            en: 'Korean style reinterpreted for the modern era.',
            ja: '現代的に再解釈された韓国의 멋.',
            zh: '现代重新演绎的韩国韵味。'
        },
        bgImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2560&auto=format&fit=crop',
        content: [
            {
                type: 'text',
                value: {
                    ko: '4층은 한국의 미적 요소를 현대 패션과 사진으로 선보이는 갤러리입니다. 한복의 곡선을 살린 모던 스타일링과 젊은 사진작가들이 시선에 담은 문화 지형도를 만나보세요.',
                    en: 'The 4th floor is a gallery presenting Korean aesthetic elements through modern fashion and photography. Meet modern styling highlighting the curves of Hanbok and cultural mappings captured through the eyes of young photographers.',
                    ja: '4층은 한국의 미적 요소를 현대 패션과 사진으로 선보이는 갤러리입니다. 한복의 곡선을 살린 모던 스타일링과 젊은 사진작가들이 시선에 담은 문화 지형도를 만나보세요.',
                    zh: '4楼是通过现代时尚和摄影展现韩国审美要素的画廊。可以见到体现韩服曲线的现代造型和年轻摄影师捕捉到的文化地貌。'
                }
            }
        ],
        subitems: [
            { id: 'kstyle', label: { ko: 'K-스타일', en: 'K-Style', ja: 'K-スタイル', zh: 'K-Style' } },
            { id: 'fashion', label: { ko: '시각 예술 / 패션', en: 'Visual Arts / Fashion', ja: '視覚芸術 / ファッション', zh: '视觉艺术 / 时尚' } }
        ]
    },
    {
        id: 'travel',
        floor: '5F',
        title: {
            ko: '로컬 헤리티지 / 여행',
            en: 'Local Heritage / Travel',
            ja: 'ローカルヘリテージ / 旅行',
            zh: '本地遗产 / 旅游'
        },
        description: {
            ko: '지역의 가치를 세계로 연결합니다.',
            en: 'Connecting local values to the world.',
            ja: '地域の価値を世界に繋げます。',
            zh: '将地区价值连接到世界。'
        },
        bgImage: 'https://images.unsplash.com/photo-1596120364993-90dcc247f07e?q=80&w=2560&auto=format&fit=crop',
        content: [
            {
                type: 'text',
                value: {
                    ko: '5층은 대한민국 각 지역의 고유한 문화를 큐레이팅하는 여행 라운지입니다. 지역색이 담긴 홍보물과 현지인들이 추천하는 특별한 코스를 통해 진정한 한국의 정취를 홍보합니다.',
                    en: 'The 5th floor is a travel lounge curating the unique culture of each region in South Korea. We promote the true mood of Korea through promotional materials with regional characteristics and special courses recommended by locals.',
                    ja: '5층은 대한민국 각 지역의 고유한 문화를 큐레이팅하는 여행 라운지입니다. 지역색이 담긴 홍보물과 현지인들이 추천하는 특별한 코스를 통해 진정한 한국의 정취를 홍보합니다.',
                    zh: '5楼是通过策划韩国各地区独特文化的旅游休息室。通过带有地域特色的宣传品和当地人推荐的特别路线宣传真正的韩国情调。'
                }
            }
        ],
        subitems: [
            { id: 'local_heritage', label: { ko: '지역 문화 유산', en: 'Local Heritage', ja: '地域文化遺産', zh: '本地文化遗产' } },
            { id: 'travel_curation', label: { ko: '여행 큐레이션', en: 'Travel Curation', ja: '旅行キュレーション', zh: '旅游策展' } }
        ]
    },
];

export const FEATURED_ITEMS: FeaturedItem[] = [
    // Promotion & Exchange
    {
        id: 'global-exchange-week',
        title: { ko: '글로벌 문화 교류 주간', en: 'Global Cultural Exchange Week', ja: 'グローバル文化交流週間', zh: '全球文化交流周' },
        category: 'Trend',
        subcategory: 'exchange',
        description: {
            ko: '전 세계의 아티스트들이 모여 각국의 문화를 공유하고 협업하는 특별한 주간입니다.',
            en: 'A special week where artists from around the world gather to share and collaborate on their respective cultures.',
            ja: '世界中のアーティストが集まり、各国の文化を共有しコラボレーションする特別な週間です。',
            zh: '世界各地的艺术家齐聚一堂，分享各国文化并进行合作的特别周。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1526894198609-10b3cdf4be0b?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '2026.05.01 - 2026.05.07', en: 'May 01 - May 07, 2026', ja: '2026.05.01 - 2026.05.07', zh: '2026.05.01 - 2026.05.07' },
        location: { ko: '1F 글로벌 라운지', en: '1F Global Lounge', ja: '1F グローバル라운지', zh: '1F 全球休息室' },
        price: { ko: '무료 참가', en: 'Free Participation', ja: '参加無料', zh: '免费参加' }
    },
    {
        id: 'global-artist-collab-2026',
        title: { ko: '2026 글로벌 아티스트 협업전: 경계를 넘어서', en: '2026 Global Artist Collab: Beyond Borders', ja: '2026 グローバルアーティストコラボ：境界を越えて', zh: '2026 全球艺术家合作展：跨越边界' },
        category: 'Trend',
        subcategory: 'collab',
        description: {
            ko: '국내외 최정상 아티스트들이 각자의 고유한 문화를 융합하여 새로운 예술적 비전을 제시하는 대규모 협업 프로젝트입니다.',
            en: 'A large-scale collaboration project where top domestic and international artists fuse their unique cultures to present a new artistic vision.',
            ja: '国内外のトップアーティストが各自の固有の文化を融合し、新しい芸術的ビジョンを提示する大規模なコラボレーションプロジェクトです。',
            zh: '国内外顶级艺术家融合各自独特文化，展现全新艺术视野的大型合作项目。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '2026.08.10 - 2026.09.10', en: 'Aug 10 - Sep 10, 2026', ja: '2026.08.10 - 2026.09.10', zh: '2026.08.10 - 2026.09.10' },
        location: { ko: '1F 글로벌 라운지', en: '1F Global Lounge', ja: '1F グローバル라운지', zh: '1F 全球休息室' },
        price: { ko: '무료 관람', en: 'Free Admission', ja: '観覧無料', zh: '免费参观' }
    },
    {
        id: 'k-culture-brand-collab',
        title: { ko: 'K-뷰티 x 전통 공예 스페셜 콜라보 팝업', en: 'K-Beauty x Traditional Craft Special Collab Pop-up', ja: 'K-ビューティー x 伝統工芸 スペシャルコラボポップアップ', zh: 'K-Beauty x 传统工艺 特别合作快闪' },
        category: 'Trend',
        subcategory: 'collab',
        description: {
            ko: '한국의 전통 공예 장인들과 뷰티 브랜드가 만나 아름다움의 본질을 현대적으로 재해석한 한정판 에디션을 선보입니다.',
            en: 'Korean traditional craft masters and beauty brands meet to present a limited edition that modernly reinterprets the essence of beauty.',
            ja: '韓国の伝統工芸職人とビューティーブランドが出会い、美の本質を現代的に再解釈した限定版エディションを披露します。',
            zh: '韩国传统工艺匠人与美妆品牌相遇，推出将美的本质进行现代重新诠释的限量版产品。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '2026.10.01 - 2026.10.15', en: 'Oct 01 - Oct 15, 2026', ja: '2026.10.01 - 2026.10.15', zh: '2026.10.01 - 2026.10.15' },
        location: { ko: '1F 팝업존', en: '1F Pop-up Zone', ja: '1F ポップアップゾーン', zh: '1F 快闪区' },
        price: { ko: '제품 구매 가능', en: 'Products Available', ja: '製品購入可能', zh: '产品可购买' }
    },
    {
        id: 'heritage-digital-archive',
        title: { ko: 'K-헤리티지 디지털 아카이브전', en: 'K-Heritage Digital Archive Exhibition', ja: 'K-ヘリテージデジタルアーカイブ展', zh: 'K-遗产数字档案展' },
        category: 'Exhibition',
        subcategory: 'media',
        description: {
            ko: '사라져가는 한국의 전통 문화를 고해상도 디지털 기술로 복원하여 보존하고 홍보합니다.',
            en: 'Preserving and promoting fading Korean traditional culture by restoring it with high-resolution digital technology.',
            ja: '消えゆく한국의 전통 문화를 고해상도 디지털 기술로 복원하여 보존하고 홍보합니다.',
            zh: '通过高分辨率数字技术修复并保存、宣传逐渐消失的韩国传统文化。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1518349619113-03114f06ac3a?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '상시 운영', en: 'Open Daily', ja: '常時運営', zh: '常年开放' },
        location: { ko: '2F 디지털 갤러리', en: '2F Digital Gallery', ja: '2F 디지털 갤러리', zh: '2F 数字画廊' },
        price: { ko: '무료 관람', en: 'Free Admission', ja: '観覧無料', zh: '免费参观' }
    },
    {
        id: 'traditional-craft-collab',
        title: { ko: '전통 공예 x 현대 디자인 협업작', en: 'Traditional Craft x Modern Design Collaboration', ja: '伝統工芸 x 現代デザイン コラボレーション', zh: '传统工艺 x 现代设计 合作作品' },
        category: 'Art',
        subcategory: 'heritage',
        description: {
            ko: '무형문화재 장인과 젊은 디자이너들이 만나 탄생시킨 새로운 감각의 공예품 전시 및 홍보.',
            en: 'Exhibition and promotion of sensuous crafts created by intangible cultural property masters and young designers.',
            ja: '무형문화재 장인과 젊은 디자이너들이 만나 탄생시킨 새로운 감각의 공예품 전시 및 홍보.',
            zh: '无形文化遗产工匠与年轻设计师共同创作的感性工艺品展示及宣传。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '2026.04.15 - 2026.05.15', en: 'Apr 15 - May 15, 2026', ja: '2026.04.15 - 2026.05.15', zh: '2026.04.15 - 2026.05.15' },
        location: { ko: '3F 크래프트 홀', en: '3F Craft Hall', ja: '3F 크래프트 홀', zh: '3F 工艺馆' },
        price: { ko: '전시 홍보', en: 'Exhibition Promo', ja: '展示広報', zh: '展览宣传' }
    },
    {
        id: 'local-heritage-tour',
        title: { ko: '지역 문화 유산 탐방 프로젝트', en: 'Local Heritage Tour Project', ja: '地域文化遺産探訪プロジェクト', zh: '地区文化遗产探访项目' },
        category: 'Travel',
        subcategory: 'local_heritage',
        description: {
            ko: '각 지자체와 협력하여 잘 알려지지 않은 보석 같은 지역 문화유산을 세계에 알립니다.',
            en: 'Collaborating with local governments to promote hidden gem-like local cultural heritages to the world.',
            ja: '각 지자체와 협력하여 잘 알려지지 않은 보석 같은 지역 문화유산을 세계에 알립니다.',
            zh: '与各地方政府合作，向世界宣传鲜为人知的宝石般的地区文化遗产。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1590635327202-b53050a49826?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '매월 셋째주 발간', en: 'Published 3rd Week Monthly', ja: '毎月第3週発刊', zh: '每月第三周发布' },
        location: { ko: '온라인 및 5F 라운지', en: 'Online & 5F Lounge', ja: '온라인 및 5F 라운지', zh: '在线及 5F 休息室' },
        price: { ko: '무료 배포', en: 'Free Distribution', ja: '無料配布', zh: '免费发布' }
    },
    {
        id: 'hanbok-symphony',
        title: { ko: '한복 심포니: 현대적 재해석', en: 'Hanbok Symphony: Modern Reinterpretation', ja: '韓服シンフォニー：現代的再解釈', zh: '韩복交响曲：现代诠释' },
        category: 'Style',
        subcategory: 'kstyle',
        description: {
            ko: '한복의 전통적인 선과 현대적인 감각이 만나 새로운 패션의 지평을 엽니다.',
            en: 'Traditional lines of Hanbok meet modern sensibility to open a new horizon in fashion.',
            ja: '韓服の伝統的な線과 현대적인 감각이 만나 새로운 패션의 지평을 엽니다.',
            zh: '韩服传统线条与现代感性相遇，开启时尚新境界。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '2026.06.01 - 2026.06.30', en: 'Jun 01 - Jun 30, 2026', ja: '2026.06.01 - 2026.06.30', zh: '2026.06.01 - 2026.06.30' },
        location: { ko: '4F K-스타일 갤러리', en: '4F K-Style Gallery', ja: '4F K-스타일 갤러리', zh: '4F K-Style 画廊' },
        price: { ko: '무료 관람', en: 'Free Admission', ja: '観覧無料', zh: '免费参观' }
    },
    {
        id: 'jeju-heritage-trail',
        title: { ko: '제주 유산 트레일 루틴', en: 'Jeju Heritage Trail Routine', ja: '済州遺産トレイルルーチン', zh: '济州遗产步道路线' },
        category: 'Travel',
        subcategory: 'travel_curation',
        description: {
            ko: '제주의 숨은 자연 유산과 전통 마을을 잇는 특별한 여행 코스를 제안합니다.',
            en: 'Suggesting a special travel course connecting hidden natural heritage and traditional villages in Jeju.',
            ja: '제주의 숨은 자연 유산과 전통 마을을 잇는 특별한 여행 코스를 제안합니다.',
            zh: '为您推荐连接济州隐藏的自然遗产和传统村庄的特别旅游路线。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1579634914106-cf268ccf560e?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '상시 운영', en: 'Always Open', ja: '常時運営', zh: '始终开放' },
        location: { ko: '5F 여행 라운지', en: '5F Travel Lounge', ja: '5F 여행 라운지', zh: '5F 旅游休息室' },
        price: { ko: '홍보 무료', en: 'Free Info', ja: '広報無料', zh: '免费宣传' }
    },
    {
        id: 'modern-minwha-class',
        title: { ko: '모던 민화 원데이 클래스', en: 'Modern Minwha One-day Class', ja: 'モダン民画ワンデークラス', zh: '现代民画一日体验课' },
        category: 'Art',
        subcategory: 'class',
        description: {
            ko: '전통 민화의 기법에 현대적인 색채를 더해 나만의 작품을 완성하는 시간입니다.',
            en: 'A time to complete your own work by adding modern colors to traditional Minwha techniques.',
            ja: '전통 민화의 기법에 현대적인 색채를 더해 나만의 작품을 완성하는 시간입니다.',
            zh: '在传统民画技法中加入现代色彩，创作属于自己的作品。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '매주 주말', en: 'Every Weekend', ja: '毎週週末', zh: '每周周末' },
        location: { ko: '3F 컬처 스페이스', en: '3F Culture Space', ja: '3F 컬처 스페이스', zh: '3F 文化空间' },
        price: { ko: '체험 무료', en: 'Free Class', ja: '体験無料', zh: '免费体验' }
    },
    {
        id: 'kpop-collab-shop',
        title: { ko: 'K-POP 아티스트 콜라보 팝업', en: 'K-POP Artist Collab Pop-up', ja: 'K-POPアーティストコラボポップアップ', zh: 'K-POP 艺人联名快闪店' },
        category: 'Trend',
        subcategory: 'collab',
        description: {
            ko: '국제적인 K-POP 아티스트와 지역 장인이 협업한 한정판 굿즈를 만날 수 있습니다.',
            en: 'Meet limited edition goods produced in collaboration with international K-POP artists and local artisans.',
            ja: '국제적인 K-POP 아티스트와 지역 장인이 협업한 한정판 굿즈를 만날 수 있습니다.',
            zh: '可以见到由国际 K-POP 艺人与当地工匠联名创作的限量版周边。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '2026.07.01 - 2026.07.15', en: 'Jul 01 - Jul 15, 2026', ja: '2026.07.01 - 2026.07.15', zh: '2026.07.01 - 2026.07.15' },
        location: { ko: '1F 익스체인지 부스', en: '1F Exchange Booth', ja: '1F 익스체인지 부스', zh: '1F 交流展位' },
        price: { ko: '무료 관람', en: 'Free Access', ja: '入場無料', zh: '免费参观' }
    },
    {
        id: 'zen-media-art',
        title: { ko: '선(禪): 미디어 아트 전시', en: 'Zen: Media Art Exhibition', ja: '禅：メディアアート展示', zh: '禅：媒体艺术展' },
        category: 'Exhibition',
        subcategory: 'media',
        description: {
            ko: '한국적 명상과 미디어 기술이 결합되어 도심 속 평온함을 선사하는 몰입형 전시입니다.',
            en: 'An immersive exhibition combining Korean meditation and media technology to provide tranquility in the city.',
            ja: '한국적 명상과 미디어 기술이 결합되어 도심 속 평온함을 선사하는 몰입형 전시입니다.',
            zh: '结合韩国式冥想与媒体技术，在都市中呈现宁静感的沉浸式展览。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '2026.08.01 - 2026.08.31', en: 'Aug 01 - Aug 31, 2026', ja: '2026.08.01 - 2026.08.31', zh: '2026.08.01 - 2026.08.31' },
        location: { ko: '2F 디지털 미디어관', en: '2F Digital Media Hall', ja: '2F 디지털 미디어관', zh: '2F 数字媒体馆' },
        price: { ko: '무료 관람', en: 'Free Admission', ja: '観覧無料', zh: '免费参观' }
    },
    {
        id: 'modern-furniture-heritage',
        title: { ko: '모던 소반 & 퍼니처 전시', en: 'Modern Soban & Furniture Exhibition', ja: 'モダン小盤＆ファニチャー展示', zh: '现代小盘与家具展' },
        category: 'Art',
        subcategory: 'heritage',
        description: {
            ko: '한국 전통 가구인 소반의 기능미를 현대 주거 공간에 어울리게 재구성한 작품전입니다.',
            en: 'An exhibition of works reconstructing the functional beauty of Soban, a traditional Korean table, to suit modern living spaces.',
            ja: '한국 전통 가구인 소반의 기능미를 현대 주거 공간에 어울리게 재구성한 작품전입니다.',
            zh: '将韩国传统家具“小盘”的功能美重新构思，使其适用于现代居住空间的早期作品展。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '2026.09.01 - 2026.09.20', en: 'Sep 01 - Sep 20, 2026', ja: '2026.09.01 - 2026.09.20', zh: '2026.09.01 - 2026.09.20' },
        location: { ko: '3F 크래프트 라이브러리', en: '3F Craft Library', ja: '3F 크래프트 라이브러리', zh: '3F 工艺图书馆' },
        price: { ko: '무료 관람', en: 'Free Viewing', ja: '観覧無料', zh: '免费参观' }
    },
    {
        id: 'global-kfood-fest',
        title: { ko: '글로벌 K-푸드 페스타', en: 'Global K-Food Fest', ja: 'グローバルK-フードフェスタ', zh: '全球 K-Food 美食节' },
        category: 'Trend',
        subcategory: 'global',
        description: {
            ko: '전 세계 셰프들이 한식의 식재료를 활용해 선보이는 퓨전 퀴진의 향연입니다.',
            en: 'A feast of fusion cuisine presented by chefs from around the world using Korean ingredients.',
            ja: '전 세계 셰프들이 한식의 식재료를 활용해 선보이는 퓨전 퀴진의 향연입니다.',
            zh: '世界各地的厨师利用韩餐食材呈现出的融合料理盛宴。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '2026.10.05 - 2026.10.12', en: 'Oct 05 - Oct 12, 2026', ja: '2026.10.05 - 2026.10.12', zh: '2026.10.05 - 2026.10.12' },
        location: { ko: '1F 컬처 광장', en: '1F Culture Plaza', ja: '1F 컬처 광장', zh: '1F 文化广场' },
        price: { ko: '시식 무료', en: 'Free Tasting', ja: '試食無料', zh: '免费试吃' }
    },
    {
        id: 'pansori-cinema',
        title: { ko: '판소리 미드나잇 시네마', en: 'Pansori Midnight Cinema', ja: 'パンソ리深夜시네마', zh: '盘索里深夜剧场' },
        category: 'Exhibition',
        subcategory: 'traditional',
        description: {
            ko: '깊은 밤, 영화적 영상미와 판소리의 깊은 울림이 만나 새로운 예술적 경험을 제공합니다.',
            en: 'At midnight, the deep resonance of Pansori meets cinematic visual beauty to provide a new artistic experience.',
            ja: '深夜, 영화적 영상미와 판소리의 깊은 울림이 만나 새로운 예술적 경험을 제공합니다.',
            zh: '深夜，盘索里的深远共鸣与电影般的视觉美感相遇，带来全新的艺术体验。'
        },
        imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2560&auto=format&fit=crop',
        date: { ko: '매주 금요일 밤', en: 'Every Friday Night', ja: '毎週金曜日夜', zh: '每周五晚' },
        location: { ko: '2F 아트 시어터', en: '2F Art Theater', ja: '2F 아트 시어터', zh: '2F 艺术影院' },
        price: { ko: '관람 무료', en: 'Free Ticket', ja: '観覧無料', zh: '免费观影' }
    }
];

export const ARTISTS_OF_THE_YEAR: Artist[] = [
    {
        id: 'artist-1',
        name: { ko: '김한얼', en: 'Han-eol Kim', ja: 'キム・ハンオル', zh: '金韩尔' },
        type: { ko: '비주얼 아티스트', en: 'Visual Artist', ja: 'ビジュアルアーティスト', zh: '视觉艺术家' },
        description: { ko: 'K-컬처의 역동성을 캔버스에 담아내는 현대 미술가', en: 'A modern artist capturing the dynamism of K-Culture on canvas', ja: 'K-컬처의 역동성을 캔버스에 담아내는 현대 미술가', zh: '在画布上捕捉 K-Culture 动态的现代艺术家' },
        imageUrl: '/assets/artists/artist-1-global.png',
        subcategory: 'global'
    },
    {
        id: 'artist-2',
        name: { ko: '이유림', en: 'Yu-rim Lee', ja: 'イ・ユリム', zh: '李宥琳' },
        type: { ko: '전통 공예 마스터', en: 'Traditional Craft Master', ja: '伝統工芸マスター', zh: '传统工艺大师' },
        description: { ko: '전통 장인 정신을 현대적 오브제로 재탄생시키는 공예가', en: 'A craftsman who rebirths traditional craftsmanship into modern objects', ja: '전통 장인 정신을 현대적 오브제로 재탄생시키는 공예가', zh: '将传统工匠精神转化为现代器物的工艺家' },
        imageUrl: '/assets/artists/artist-2-heritage.png',
        subcategory: 'heritage'
    },
    {
        id: 'artist-3',
        name: { ko: '최현석', en: 'Hyun-seok Choi', ja: 'チェ・ヒョンソク', zh: '崔贤硕' },
        type: { ko: '교류 프로젝트 디렉터', en: 'Exchange Project Director', ja: '交流プロジェクトディレクター', zh: '交流项目总监' },
        description: { ko: '국가 간 문화적 경계를 허무는 글로벌 프로젝트 설계자', en: 'A global project designer breaking down cultural boundaries between nations', ja: '국가 간 문화적 경계를 허무는 글로벌 프로젝트 설계자', zh: '打破国家间文化界限的全球项目设计师' },
        imageUrl: '/assets/artists/artist-3-exchange.png',
        subcategory: 'exchange'
    },
    {
        id: 'artist-4',
        name: { ko: '박지민', en: 'Ji-min Park', ja: 'パク・ジミン', zh: '朴智敏' },
        type: { ko: '콜라보레이션 아티스트', en: 'Collaboration Artist', ja: 'コラボレーションアーティスト', zh: '合作艺术家' },
        description: { ko: '다양한 장르의 경계를 넘나드는 웅합 예술가', en: 'A convergence artist crossing the boundaries of various genres', ja: '다양한 장르의 경계를 넘나드는 웅합 예술가', zh: '横跨多种领域界限的融合艺术家' },
        imageUrl: '/assets/artists/artist-4-collab.png',
        subcategory: 'collab'
    },
    {
        id: 'artist-5',
        name: { ko: '정경숙', en: 'Kyung-sook Jung', ja: 'チョン・ギョンスク', zh: '郑京淑' },
        type: { ko: '무형문화재 이수자', en: 'Intangible Cultural Property Trainee', ja: '無形文化財履修者', zh: '无형문화재传承人' },
        description: { ko: '전통의 소리와 몸짓을 현대에 전달하는 가교', en: 'A bridge delivering traditional sounds and gestures to the present', ja: '전통의 소리와 몸짓을 현대에 전달하는 가교', zh: '连接传统声韵与身段至现代的桥梁' },
        imageUrl: '/assets/artists/artist-5-traditional.png',
        subcategory: 'traditional'
    },
    {
        id: 'artist-6',
        name: { ko: '강다현', en: 'Da-hyun Kang', ja: 'カン・ダヒョン', zh: '姜多贤' },
        type: { ko: '미디어 아티스트', en: 'Media Artist', ja: 'メディアアーティスト', zh: '媒体艺术家' },
        description: { ko: '디지털 기술로 가상과 현실의 문화를 엮는 작가', en: 'An artist weaving virtual and real cultures through digital technology', ja: '디지털 기술로 가상과 현실의 문화를 엮는 작가', zh: '以数字技术融合虚拟与现实文化的作者' },
        imageUrl: '/assets/artists/artist-6-media.png',
        subcategory: 'media'
    },
    {
        id: 'artist-7',
        name: { ko: '윤진서', en: 'Jin-seo Yoon', ja: 'ユン・ジンソ', zh: '尹珍序' },
        type: { ko: '컬처 클래스 마스터', en: 'Culture Class Master', ja: '컬쳐 클래스 마스터', zh: '文化课程大师' },
        description: { ko: '일상 속에 한국의 미를 심어주는 예술 교육자', en: 'An art educator planting Korean beauty in everyday life', ja: '일상 속에 한국의 미를 심어주는 예술 교육자', zh: '在日常生活中播种韩国之美的艺术教育者' },
        imageUrl: '/assets/artists/artist-7-class.png',
        subcategory: 'class'
    },
    {
        id: 'artist-8',
        name: { ko: '임하늘', en: 'Ha-neul Lim', ja: 'イム・ハヌル', zh: '任河那' },
        type: { ko: 'K-스타일 디자이너', en: 'K-Style Designer', ja: 'K-スタイルデザイナー', zh: 'K-Style 设计师' },
        description: { ko: '한복의 철학을 현대적 의상으로 풀어내는 디자이너', en: 'A designer unraveling the philosophy of Hanbok into modern clothing', ja: '한복의 철학을 현대적 의상으로 풀어내는 디자이너', zh: '将韩服哲学融入现代服饰的设计师' },
        imageUrl: '/assets/artists/artist-8-kstyle.png',
        subcategory: 'kstyle'
    },
    {
        id: 'artist-9',
        name: { ko: '송민호', en: 'Min-ho Song', ja: 'ソン・ミンホ', zh: '宋旻浩' },
        type: { ko: '로컬 헤리티지 아카이브', en: 'Local Heritage Archivist', ja: '로컬 헤리티지 아카이브', zh: '本地遗产档案员' },
        description: { ko: '지역의 숨겨진 유산을 발굴하여 기록하는 기록가', en: 'A recorder who excavates and records hidden local heritage', ja: '지역의 숨겨진 유산을 발굴하여 기록하는 기록가', zh: '发掘并记录地区隐藏遗产的记录者' },
        imageUrl: '/assets/artists/artist-9-local_heritage.png',
        subcategory: 'local_heritage'
    },
    {
        id: 'artist-10',
        name: { ko: '서유나', en: 'Yu-na Seo', ja: 'ソ・ユナ', zh: '徐宥娜' },
        type: { ko: '트래블 큐레이터', en: 'Travel Curator', ja: 'トラ벨큐레이터', zh: '旅游策展人' },
        description: { ko: '문화와 여행을 결합하여 새로운 여정을 제안하는 큐레이터', en: 'A curator suggesting new journeys by combining culture and travel', ja: '문화와 여행을 결합하여 새로운 여정을 제안하는 큐레이터', zh: '结合文化与旅游并推荐新行程的策展人' },
        imageUrl: '/assets/artists/artist-10-travel_curation.png',
        subcategory: 'travel_curation'
    }
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
    {
        id: 'cal-1',
        date: '2026-03-05',
        title: { ko: '글로벌 K-컬처 포럼', en: 'Global K-Culture Forum', ja: 'グローバルK-カルチャーフォーラム', zh: '全球 K-Culture 论坛' },
        category: 'global',
        imageUrl: 'https://images.unsplash.com/photo-1540575861501-7c00117fb3c9?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 'cal-2',
        date: '2026-03-12',
        title: { ko: '전통 달항아리 특별전', en: 'Traditional Moon Jar Exhibition', ja: '伝統月壺特別展', zh: '传统月亮罐特别展' },
        category: 'heritage',
        imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=2673&auto=format&fit=crop'
    },
    {
        id: 'cal-3',
        date: '2026-03-20',
        title: { ko: '미디어 아트 라이브 쇼', en: 'Media Art Live Show', ja: 'メディアアートライブショー', zh: '媒体艺术现场表演' },
        category: 'media',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 'cal-4',
        date: '2026-03-28',
        title: { ko: 'K-스타일 패션 위크', en: 'K-Style Fashion Week', ja: 'K-スタイルファッションウィーク', zh: 'K-Style 时尚周' },
        category: 'kstyle',
        imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2574&auto=format&fit=crop'
    }
];

export const BRAND_SPOTLIGHTS: BrandSpotlight[] = [
    {
        id: 'brand-1',
        brandName: { ko: '청백 (CheongBaek)', en: 'CheongBaek', ja: 'チョンベク', zh: '青白' },
        title: { ko: '백자의 고결함을 입다', en: 'Wearing the Purity of White Porcelain', ja: '白磁の高潔さを纏う', zh: '身披白瓷的高洁' },
        description: { ko: '조선 백자의 선과 색을 현대적인 패션 라인으로 재해석한 프리미엄 브랜드', en: 'A premium brand reinterpreting the lines and colors of Joseon white porcelain into modern fashion', ja: '朝鮮白磁의 선과 색을 현대적인 패션 라인으로 재해석한 프리미엄 브랜드', zh: '将朝鲜白瓷的线条与色彩重新诠释为现代时尚系列的精品品牌' },
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2670&auto=format&fit=crop',
        tags: [{ ko: '미니멀', en: 'Minimal', ja: 'ミニマル', zh: '简约' }, { ko: '전통', en: 'Traditional', ja: 'Traditional', zh: '传统' }]
    },
    {
        id: 'brand-2',
        brandName: { ko: '심지 (SIMJI)', en: 'SIMJI', ja: 'シム지', zh: '心志' },
        title: { ko: '마음의 향을 피우다', en: 'Light the Scent of the Heart', ja: '心の香を焚く', zh: '点燃心之芬芳' },
        description: { ko: '전통 향도 문화를 바탕으로 일상의 평온을 제안하는 라이프스타일 브랜드', en: 'A lifestyle brand suggesting daily tranquility based on traditional incense culture', ja: '전통 향도 문화를 바탕으로 일상의 평온을 제안하는 라이프스타일 브랜드', zh: '以传统香道文化为基础，倡导日常宁静的生活方式品牌' },
        imageUrl: 'https://images.unsplash.com/photo-1541604193435-22287d32c29e?q=80&w=2670&auto=format&fit=crop',
        tags: [{ ko: '웰니스', en: 'Wellness', ja: 'ウェルネス', zh: '健康' }, { ko: '아로마', en: 'Aroma', ja: 'アロマ', zh: '芳香' }]
    }
];

export const LIVE_SHORTS: LiveShort[] = [
    {
        id: 'short-1',
        title: { ko: '글로벌 K-컬쳐', en: 'Tradition Dance Guerrilla Performance', ja: '伝統舞踊ゲリラ公演', zh: '传统舞蹈快闪表演' },
        videoUrl: './video/k-culture.mp4',

        location: { ko: '1F 글로벌 K-컬쳐', en: '1F Central Plaza', ja: '1F 中央広場', zh: '1F 中央广场' },
        viewCount: 12500
    },
    {
        id: 'short-2',
        title: { ko: '전통의 현대화', en: 'K-Food Pop-up Kitchen Live', ja: 'K-フードポップアップキッチンLive', zh: 'K-Food 弹出式厨房现场' },
        videoUrl: './video/modern_tradition.mp4',

        location: { ko: '1F 전통의 현대화', en: 'B1 Gourmet Street', ja: 'B1 ゴルメストリート', zh: 'B1 美食街' },
        viewCount: 8900
    },
    {
        id: 'short-3',
        title: { ko: '문화 교류', en: 'Media Art Docent Tour', ja: 'メディアアートドセントツアー', zh: '媒体艺术讲解之旅' },
        videoUrl: './video/media_gallery.mp4',

        location: { ko: '2F 문화 교류 부스', en: '2F Art Theater', ja: '2F 아트 시어터', zh: '2F 艺术影院' },
        viewCount: 15200
    },
    {
        id: 'short-4',
        title: { ko: '협업 프로젝트', en: 'Traditional Hanbok Runway Highlights', ja: '伝統韓服ランウェイハイライト', zh: '传统韩服时装秀亮点' },
        videoUrl: './video/hanbok_runway.mp4',

        location: { ko: '1F 협업 프로젝트', en: '1F Culture Plaza', ja: '1F カルチャースクエア', zh: '1F 文化广场' },
        viewCount: 22000
    },
    {
        id: 'short-5',
        title: { ko: '전통 예술', en: 'Mother-of-Pearl Craftsmanship Demo', ja: '螺鈿漆器職人実演会', zh: '螺钿漆器工匠演示会' },
        videoUrl: './video/najeon_demo.mp4',

        location: { ko: '3F 전통 예술', en: '3F Craft Library', ja: '3F クラフトライブラリー', zh: '3F 工艺图书馆' },
        viewCount: 18400
    },
    {
        id: 'short-6',
        title: { ko: '스트리트 댄스 배틀 결승전', en: 'Street Dance Battle Finals', ja: 'ストリートダンスバトル決勝戦', zh: '街舞对决总决赛' },
        videoUrl: './video/dance_battle.mp4',

        location: { ko: '3F 현대 미디어 아트', en: 'B2 Underground Stage', ja: 'B2 アンダーグラウンドステージ', zh: 'B2 地下舞台' },
        viewCount: 31500
    },
    {
        id: 'short-7',
        title: { ko: '달항아리 다도 체험 클래스', en: 'Moon Jar Tea Ceremony Class', ja: '月壺茶道体験クラス', zh: '月亮罐茶道体验课' },
        videoUrl: './video/tea_ceremony.mp4',

        location: { ko: '4F 문화 체험 클래스', en: '5F Korean Dining', ja: '5F コリアンダイニング', zh: '5F 韩国餐厅' },
        viewCount: 14200
    },
    {
        id: 'short-8',
        title: { ko: '디지털 한글 타이포그래피 전', en: 'Digital Hangeul Typography Exhibition', ja: 'デジタルハングルタイポグラフィ展', zh: '数字韩文版式展' },
        videoUrl: './video/hangeul_typo.mp4',

        location: { ko: '4F 글로벌 K-스타일', en: '2F Art Theater', ja: '2F アートシアター', zh: '2F 艺术影院' },
        viewCount: 27800
    },
    {
        id: 'short-9',
        title: { ko: '가야금 현대 음악 라이브', en: 'Gayageum Modern Music Live', ja: 'カヤグム現代音楽ライブ', zh: '伽倻琴现代音乐现场' },
        videoUrl: './video/gayageum_live.mp4',

        location: { ko: '5F 지역 문화 유산', en: '4F Rest Lounge', ja: '4F レストラウンジ', zh: '4F 休息区' },
        viewCount: 19500
    },
    {
        id: 'short-10',
        title: { ko: '전통 막걸리 양조 클래스', en: 'Traditional Makgeolli Brewing Class', ja: '伝統マッコリ醸造クラス', zh: '传统马格利酿造课程' },
        videoUrl: './video/makgeolli_brew.mp4',

        location: { ko: '5F 여행 큐레이션', en: 'B1 Gourmet Street', ja: 'B1 ゴルメストリート', zh: 'B1 美食街' },
        viewCount: 26300
    }
];
