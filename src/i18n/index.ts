import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
    ko: {
        translation: {
            "floor_guide": "층별 안내",
            "nav": {
                "login": "로그인",
                "gallery": "VIA STATION",
                "floor-tech-care": "1F | 테크 앤 케어",
                "floor2": "2F | 뷰티 앤 케어",
                "floor3": "3F | 라이프스타일 큐레이션",
                "floor-gather-mall": "4F | 게더 몰",
                "floor5": "5F | 패션 아카이브",
                "floor6": "6F | 로컬 헤리티지",

                "tickets": "회사소개",
                "art": "입점사 로그인",
                "travel": "브랜드 철학",
                "membership": "멤버십 클럽",
                "partnership": "입점/제휴 문의",
                "offline": "오프라인 가이드",
                "sound_on": "소리 켜기",
                "sound_off": "소리 끄기",
                "search": "검색",
                "language": "언어"
            },

            "hero": {
                "title": "시선과 취향이 만나는 곳",
                "subtitle": "시선 끝에 맺힌 세상이 당신의 취향으로 완성되는 과정을 경험해 보십시오, VIA STATION",
                "cta": "층별 안내 보기",
                "tagline": "새로운 취향을 발견하는 인터랙티브 커넥티드 플랫폼",
                "title_main": "VIA STATION",
                "title_sub": "THE VIRTUAL GATEWAY",
                "description": "수많은 브랜드와 당신의 일상을 연결하는 영감의 허브. 당신의 탐험이 의미 있는 발견으로 이어지는 곳, VIA STATION입니다.",
                "warping": "워핑 중...",
                "explore": "탐험하기",
                "story": "입점사 로그인",
                "philosophy": "브랜드 철학",
                "welcome": "Welcome to VIA STATION",
                "site_description": "다양한 아카이브를 자유롭게 넘나들며 나만의 라이프스타일을 완성하는 메타 게이트웨이. 모든 여정이 특별한 발견과 연결로 이어지는 프리미엄 통합 플랫폼, VIA STATION입니다.",
                "start": "시작하기"
            },
            "subcategory": {
                "car-care": "CAR 케어",
                "window": "디지털 쇼윈도",
                "f1_kpop": "K-팝 스테이지",
                "f1_library": "트렌드 라이브러리",
                "f1_tech": "한류 테크존",
                "skincare": "스킨케어",
                "hair": "헤어케어",
                "perfume": "퍼퓸",
                "inner-beauty": "이너 뷰티",
                "body-care": "바디케어",
                "performance": "공연 실황",
                "exhibit": "가상 전시",
                "f3_media": "미디어 아트 홀",
                "f3_lounge": "아티스트 라운지",
                "f3_audio": "사운드 아카이브",
                "b2b-mall": "B2B 몰",
                "interview": "아티스트 인터뷰",
                "f4_plus": "토크 플러스",
                "f4_book": "도서관 섹션",
                "f4_seminar": "세미나 룸",
                "archive": "패션 아카이브",
                "collection": "시즌 컬렉션",
                "f5_material": "소재 도서관",
                "f5_fitting": "피팅 스튜디오",
                "f5_textile": "텍스타일 룸",
                "heritage": "지역 문화 유산",
                "travel": "전략적 앵커",
                "f6_gourmet": "미식 아카이브",
                "f6_craft": "지역 공예관",
                "f6_tour": "헤리티지 투어"
            },
            "subcategory_desc": "전통의 깊이와 현대적 감각이 교차하는 지점에서 발견한 새로운 영감의 기록들을 탐색합니다.",
            "subcategory_guide": "하단의 3D 가상공간 미리보기를 클릭하여 시공간을 넘나드는 몰입형 검색을 시작해보세요.",
            "subcategory_msg": {
                "car-care": "자동차 테크와 라이프스타일 케어의 품격 있는 조화를 한눈에 조망합니다.",
                "window": "기술과 예술이 결합된 가상 공간에서 만나는 새로운 브랜드의 시각적 경험입니다.",
                "f1_kpop": "무대의 열기와 아티스트의 열정이 담긴 K-팝의 정수를 기록하고 공유합니다.",
                "f1_library": "동시대의 취향과 유행을 기록한 아카이브를 통해 새로운 영감을 발견합니다.",
                "f1_tech": "한류 문화의 확산을 이끄는 기술적 도전과 혁신적인 미디어 아트를 선보입니다.",
                "skincare": "피부 본연의 건강함과 맑은 결을 찾아가는 정교한 스킨케어 큐레이션입니다.",
                "hair": "전문적인 헤어 솔루션을 통해 건강한 모발과 아름다운 스타일의 조화를 제안합니다.",
                "perfume": "기억의 문을 여는 향기, 브랜드의 철학을 후각으로 경험하는 감각적인 공간입니다.",
                "inner-beauty": "몸 안의 밸런스를 맞춰 진정한 아름다움의 에너지를 채우는 웰니스 솔루션입니다.",
                "body-care": "지친 몸에 휴식을 선사하고 온전한 나를 만나는 섬세한 바디 케어 리추얼입니다.",
                "performance": "그날의 공기와 함성까지 고스란히 담아낸 생동감 넘치는 공연의 기록들입니다.",
                "exhibit": "물리적 제약을 넘어 시공간을 초월해 만나는 예술적 감동의 아카이브입니다.",
                "f3_media": "빛과 소리가 빚어내는 환상적인 미디어 아트 시스템을 온몸으로 경험합니다.",
                "f3_lounge": "창작자의 고뇌와 영감이 머무는 공간에서 아티스트의 특별한 이야기를 듣습니다.",
                "f3_audio": "우리의 기억 속에 남겨진 소리의 기록들을 통해 청각적 영감을 탐구합니다.",
                "b2b-mall": "파트너십과 비즈니스 협력을 위한 전용 라운지로, 새로운 기회를 발견하는 네트워킹의 현장을 기록합니다.",
                "interview": "작품 너머에 숨겨진 솔직하고 깊이 있는 아티스트의 목소리를 담았습니다.",
                "f4_plus": "지식의 확장과 영감의 교류가 일어나는 특별한 인터랙티브 플랫폼입니다.",
                "f4_book": "세월의 지혜와 예술적 감각이 깃든 큐레이션 도서들을 깊이 있게 탐닉합니다.",
                "f4_seminar": "세미나 룸: 함께 배우고 나눌 때 가치가 더해지는 성찰과 지적 교류의 장입니다.",
                "archive": "시대를 초월한 스타일의 기록을 통해 패션이 지닌 예술적 가치를 조명합니다.",
                "collection": "계절의 변화와 시대의 감각을 담아낸 가장 세련된 스타일의 완성형입니다.",
                "f5_material": "예술적 표현의 기초가 되는 다양한 소재와 텍스처의 본질을 탐구합니다.",
                "f5_fitting": "자신만의 스타일을 완성하고 예술적 감각을 직접 체험하는 창의적인 공간입니다.",
                "f5_textile": "섬세한 실과 직조 기술이 만들어내는 무한한 가능성과 시각적 즐거움을 선사합니다.",
                "heritage": "시간의 깊이를 간직한 지역 고유의 문화적 유산을 현대적인 시선으로 재조명합니다.",
                "travel": "새로운 여행의 시작점이자 지역의 매력을 연결하는 전략적인 공간을 탐색합니다.",
                "f6_gourmet": "지역의 맛과 향이 담긴 미식 문화를 통해 오감을 깨우는 경험을 제공합니다.",
                "f6_craft": "장인의 손길과 정성이 깃든 한국 공예의 아름다움을 현대적으로 제안합니다.",
                "f6_tour": "지역의 숨겨진 보석 같은 이야기들을 따라가는 역사와 문화의 여정입니다."
            },
            "featured": {
                "title": "추천 & 이벤트",
                "subtitle": "Culture Dept.에서 만나는 특별한 경험",
                "no_content": "등록된 콘텐츠가 없습니다."
            },
            "about": {
                "title": "취향이 살아 숨쉬는 공간, VIA STATION",
                "subtitle": "전통의 깊이와 현대의 감각이 교차하는 아트 갤러리 백화점",
                "description1": "VIA STATION은 단순한 소비 공간을 넘어, 일상에 영감을 불어넣는 프리미엄 문화 큐레이션 플랫폼입니다.",
                "description2": "가장 트렌디한 K-컬처부터 세월의 깊이를 품은 헤리티지까지, 당신의 시선을 머물게 할 수준 높은 전시와 예술적 경험을 선사합니다.",
                "cta": "브랜드 철학 보기"
            },
            "auth": {
                "login": "로그인",
                "register": "회원가입",
                "email": "이메일",
                "password": "비밀번호",
                "name": "이름",
                "logout": "로그아웃",
                "welcome": "환영합니다",
                "login_title": "로그인",
                "register_title": "회원가입",
                "no_account": "계정이 없으신가요?",
                "have_account": "이미 계정이 있으신가요?",
                "signup": "가입하기",
                "submit": "확인",
                "loading": "처리 중...",
                "error_generic": "오류가 발생했습니다."
            },
            "footer": {
                "address": "서울특별시 중구 소공로 123",
                "copyright": "© 2026 VIA STATION. All rights reserved.",
                "privacy": "개인정보처리방침",
                "terms": "이용약관",
                "shop": "SHOP",
                "support": "지원",
                "contact": "문의",
                "description": "대한민국의 아름다운 문화와 예술을 세계에 알리는 프리미엄 문화 플랫폼입니다.",
                "notice": "공지사항",
                "faq": "자주 묻는 질문",
                "inquiry": "1:1 문의",
                "weekdays": "평일 10:00 - 18:00 (주말/공휴일 휴무)",
                "representative": "대표자: 안기정",
                "business_id": "사업자등록번호: 123-45-67890",
                "mail_order_id": "통신판매업신고: 2026-서울중구-1234"
            },
            "faq": {
                "search_placeholder": "궁금하신 내용을 검색해보세요..."
            },
            "common": {
                "not_found": "페이지를 찾을 수 없습니다.",
                "not_found_desc": "요청하신 정보를 찾을 수 없거나 삭제되었을 수 있습니다.",
                "item_not_found": "아이템을 찾을 수 없습니다.",
                "go_inspiration": "인스피레이션으로 돌아가기",
                "no_info": "정보 없음",
                "back_home": "홈으로 돌아가기",
                "back": "뒤로",
                "price": "금액",
                "loading_content": "콘텐츠를 불러오는 중입니다..."
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: 'ko', // Default language
        fallbackLng: 'ko',
        supportedLngs: ['ko', 'en', 'ja', 'zh', 'fr', 'de', 'es', 'it', 'ru', 'pt', 'nl', 'pl', 'sv', 'ar', 'tr', 'fa', 'he', 'vi', 'th', 'id', 'hi'],
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage', 'cookie'],
            convertDetectedLanguage: (lng) => lng.split('-')[0], // Always use short code
        },
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
