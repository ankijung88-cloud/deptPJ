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
                "gallery": "department",
                "floor1": "1F | K-컬처 트렌드",
                "floor2": "2F | 미디어 룸",
                "floor3": "3F | 라이프스타일 큐레이션",
                "floor4": "4F | 컬처 토크",
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
                "subtitle": "시선 끝에 맺힌 세상이 당신의 취향으로 완성되는 과정을 경험해 보십시오, department",
                "cta": "층별 안내 보기",
                "tagline": "한국의 유산과 현대적 공간",
                "title_main": "디파트먼트",
                "title_sub": "OF K-CULTURE",
                "description": "전통과 현대가 어우어진 새로운 공간의 재해석. 우리의 유산에서 영감을 얻어 시대를 앞서가는 경험을 제안합니다.",
                "warping": "워핑 중...",
                "explore": "탐험하기",
                "story": "입점사 로그인",
                "philosophy": "브랜드 철학",
                "arrived": "가상의 공간에 도착했습니다",
                "welcome": "Welcome to the Virtual Gateway",
                "site_description": "당신의 시선이 머무는 모든 곳이 예술이 되는 공간. 전통의 가치와 현대의 감각이 공존하는 프리미엄 문화 큐레이션 플랫폼 department입니다.",
                "start": "시작하기"
            },
            "subcategory": {
                "global": "글로벌 트렌드",
                "window": "디지털 쇼윈도",
                "f1_kpop": "K-팝 스테이지",
                "f1_library": "트렌드 라이브러리",
                "f1_tech": "한류 테크존",
                "sync": "시너지 공간",
                "pop": "다이내믹 팝업",
                "f2_lab": "브랜드 랩",
                "f2_art": "아트 콜라보",
                "f2_gallery": "한정판 갤러리",
                "performance": "공연 실황",
                "exhibit": "가상 전시",
                "f3_media": "미디어 아트 홀",
                "f3_lounge": "아티스트 라운지",
                "f3_audio": "사운드 아카이브",
                "talk": "문화 담론",
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
                "global": "전 세계를 매료시킨 K-컬처의 흐름과 동시대적 감각을 한눈에 조망합니다.",
                "window": "기술과 예술이 결합된 가상 공간에서 만나는 새로운 브랜드의 시각적 경험입니다.",
                "f1_kpop": "무대의 열기와 아티스트의 열정이 담긴 K-팝의 정수를 기록하고 공유합니다.",
                "f1_library": "동시대의 취향과 유행을 기록한 아카이브를 통해 새로운 영감을 발견합니다.",
                "f1_tech": "한류 문화의 확산을 이끄는 기술적 도전과 혁신적인 미디어 아트를 선보입니다.",
                "sync": "서로 다른 가치가 만나 새로운 조화를 이루는 창의적인 교류의 현장을 기록합니다.",
                "pop": "끊임없이 변화하고 움직이는 트렌드의 가장 앞선 조각들을 모았습니다.",
                "f2_lab": "브랜드의 철학과 가치가 실험적인 시도를 통해 완성되는 과정을 탐색합니다.",
                "f2_art": "예술가와 브랜드가 만나 경계를 허물고 창조한 독창적인 예술 세계를 만납니다.",
                "f2_gallery": "세상에 단 하나뿐인 희소성과 가치를 지닌 특별한 컬렉션을 큐레이션합니다.",
                "performance": "그날의 공기와 함성까지 고스란히 담아낸 생동감 넘치는 공연의 기록들입니다.",
                "exhibit": "물리적 제약을 넘어 시공간을 초월해 만나는 예술적 감동의 아카이브입니다.",
                "f3_media": "빛과 소리가 빚어내는 환상적인 미디어 아트 시스템을 온몸으로 경험합니다.",
                "f3_lounge": "창작자의 고뇌와 영감이 머무는 공간에서 아티스트의 특별한 이야기를 듣습니다.",
                "f3_audio": "우리의 기억 속에 남겨진 소리의 기록들을 통해 청각적 영감을 탐구합니다.",
                "talk": "문화의 깊이를 더하는 통찰력 있는 대화와 토론이 이어지는 공간입니다.",
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
                "title": "취향이 살아 숨쉬는 공간, department",
                "subtitle": "전통의 깊이와 현대의 감각이 교차하는 아트 갤러리 백화점",
                "description1": "department은 단순한 소비 공간을 넘어, 일상에 영감을 불어넣는 프리미엄 문화 큐레이션 플랫폼입니다.",
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
                "copyright": "© 2026 Culture Dept. Store. All rights reserved.",
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
            "common": {
                "view_all": "전체 보기",
                "view_details": "상세 내역",
                "date": "일정",
                "location": "장소",
                "price": "금액",
                "loading": "로딩 중...",
                "error": "오류가 발생했습니다.",
                "no_content": "콘텐츠가 없습니다.",
                "back_home": "홈으로 돌아가기",
                "back": "뒤로",
                "duration": "소요 시간",
                "duration_value": "약 90분",
                "detail_intro": "상세 소개",
                "product": "상품명",
                "select_date": "날짜 선택",
                "download": "상품 다운로드",
                "delete": "삭제",

                "share_modal": {
                    "title": "공유하기",
                    "copy_link": "링크 복사",
                    "copied": "링크가 복사되었습니다.",
                    "sns": {
                        "kakao": "카카오톡",
                        "facebook": "페이스북",
                        "twitter": "트위터",
                        "more": "더보기"
                    }
                },
                "admin": {
                    "sidebar": {
                        "title": "관리자 시스템",
                        "products": "상품 관리",
                        "users": "회원 관리",
                        "bookings": "프로그램 기록",
                        "logout": "로그아웃"
                    },
                    "product": {
                        "title": "상품 관리",
                        "add": "상품 등록",
                        "edit": "상품 수정",
                        "delete_confirm": "정말로 이 상품을 삭제하시겠습니까?",
                        "search_placeholder": "상품명으로 검색...",
                        "table": {
                            "image": "이미지",
                            "title": "상품명",
                            "category": "카테고리",
                            "price": "가격",
                            "actions": "관리"
                        },
                        "form": {
                            "basic_info": "기본 정보",
                            "content_details": "상세 내용",
                            "image_label": "상품 이미지",
                            "video_label": "YouTube 영상 URL (선택)",
                            "main_category": "메인 카테고리 (층)",
                            "sub_category": "서브 카테고리",
                            "manage_closed": "휴무일 관리",
                            "closed_description": "달력에서 날짜를 클릭하여 휴무일을 설정하세요. (빨간색: 휴무)",
                            "selected_closed": "선택된 휴무일",
                            "no_closed": "선택된 휴무일이 없습니다.",
                            "save": "저장하기",
                            "saving": "저장 중...",
                            "upload_image": "이미지 업로드",
                            "uploading": "업로드 중...",
                            "replace_image": "이미지 교체",
                            "closed_day": "휴무일",
                            "open_day": "영업일"
                        }
                    },
                    "user": {
                        "title": "회원 관리",
                        "subtitle": "전체 회원 관리 및 권한 설정",
                        "search_placeholder": "이름 또는 이메일 검색",
                        "table": {
                            "user": "사용자",
                            "email": "이메일",
                            "role": "권한",
                            "actions": "관리"
                        },
                        "promote": "승격",
                        "demote": "강등",
                        "delete": "삭제",
                        "no_users": "검색된 회원이 없습니다."
                    },
                    "booking": {
                        "title": "프로그램 기록 관리",
                        "filter": {
                            "status": "상태",
                            "payment": "유형",
                            "search": "검색 (내용)",
                            "from": "시작일",
                            "to": "종료일",
                            "all_status": "전체 상태",
                            "all_methods": "전체 유형"
                        },
                        "table": {
                            "date": "일시",
                            "user": "사용자",
                            "product": "프로그램 / 카테고리",
                            "payment": "유형",
                            "amount": "수량 / 참여",
                            "settlement": "기록 요약",
                            "status": "상태",
                            "actions": "관리"
                        }
                    }
                }
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
