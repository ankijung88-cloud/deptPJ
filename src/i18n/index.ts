import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
    ko: {
        translation: {
            "floor_guide": "층별 안내",
            "floor_guide_subtitle": "Floor Guide",
            "nav": {
                "login": "로그인",
                "mypage": "마이페이지",
                "about": "소개",
                "store": "스토어",
                "gallery": "department",
                "floor1": "1F | K-컬처 트렌드",
                "floor2": "2F | 미디어 룸",
                "floor3": "3F | 라이프스타일 큐레이션",
                "floor4": "4F | 컬처 토크",
                "floor5": "5F | 패션 아카이브",
                "floor6": "6F | 로컬 헤리티지",

                "notice": "공지사항",
                "qna": "Q&A",
                "reviews": "후기",
                "tickets": "티켓 예매",
                "art": "아트 컬렉션",
                "travel": "로컬 여행",
                "sound_on": "소리 켜기",
                "sound_off": "소리 끄기",
                "search": "검색",
                "language": "언어"
            },
            "category": {
                "trend": {
                    "title": "트렌드 / 팝업",
                    "description": "가장 빠르고 핫한 K-컬처 트렌드"
                },
                "tickets": {
                    "title": "공연 / 전시",
                    "description": "감동과 전율이 있는 무대, 예술을 만나는 시간"
                },
                "art": {
                    "title": "활동 / 스타일",
                    "description": "활동과 스타일의 조화"
                },
                "style": {
                    "title": "사진 / 영상",
                    "description": "창의적인 시각 예술과 미디어"
                },
                "travel": {
                    "title": "로컬 / 여행",
                    "description": "대한민국 구석구석, 숨겨진 아름다움을 찾아서"
                },

                "community": {
                    "title": "커뮤니티",
                    "description": "취향을 나누고 함께 즐기는 공간"
                }
            },
            "hero": {
                "title": "시선과 취향이 만나는 곳",
                "subtitle": "시선 끝에 맺힌 세상이 당신의 취향으로 완성되는 과정을 경험해 보십시오, department",
                "cta": "층별 안내 보기",
                "promotion_title": "문화의 시선, 교류의 시작",
                "promotion_subtitle": "전통과 현대가 어우러지는 한국 문화의 정수를 세계와 공유합니다.",
                "promotion_cta": "문화 교류 알아보기",
                "tagline": "한국의 유산과 현대적 공간",
                "title_main": "디파트먼트",
                "title_sub": "OF K-CULTURE",
                "description": "전통과 현대가 어우러진 새로운 공간의 재해석. 우리의 유산에서 영감을 얻어 시대를 앞서가는 경험을 제안합니다.",
                "warping": "워핑 중...",
                "explore": "컬렉션 둘러보기",
                "story": "브랜드 스토리",
                "arrived": "가상의 공간에 도착했습니다",
                "welcome": "Welcome to the Virtual Gateway",
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
                "error_generic": "오류가 발생했습니다.",
                "forgot_password": "비밀번호 찾기",
                "find_id": "이메일 찾기",
                "reset_password_sent": "비밀번호 재설정 이메일이 발송되었습니다.",
                "find_email_success": "사용자님의 이메일은 {{email}} 입니다.",
                "find_email_not_found": "해당 정보로 등록된 계정을 찾을 수 없습니다.",
                "social_login": "간편 로그인",
                "google_login": "Google로 계속하기",
                "signup_success_check_email": "회원가입이 완료되었습니다! 이메일을 확인하여 계정을 인증해 주세요.",
                "rate_limit_exceeded": "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
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
                "weekdays": "평일 10:00 - 18:00 (주말/공휴일 휴무)"
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
                "register_product": "상품 등록",
                "guest": "게스트",
                "not_found": "카테고리를 찾을 수 없습니다",
                "not_found_desc": "요청하신 페이지가 존재하지 않거나 현재 준비 중입니다.",
                "go_inspiration": "인스피레이션 홈으로",
                "no_info": "정보 없음",
                "loading_content": "컨텐츠를 불러오는 중..."
            },
            "search": {
                "placeholder": "검색어를 입력하세요...",
                "no_results": "검색 결과가 없습니다.",
                "results_for": "'{{query}}'에 대한 검색 결과",
                "close": "닫기"
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
                    },
                    "settle": "확인",
                    "settle_confirm": "이 기록을 확인 처리하시겠습니까?",
                    "settle_error": "처리에 실패했습니다.",
                    "settled": "확인 완료",
                    "pending_settle": "대기 중",
                    "delete_confirm": "기록을 삭제하시겠습니까?"
                }
            }
        }
    },
    en: {
        translation: {
            "floor_guide": "Floor Guide",
            "floor_guide_subtitle": "Floor Guide",
            "nav": {
                "about": "About",
                "store": "Store",
                "gallery": "Department",
                "floor1": "1F | K-CULTURE TRENDS",
                "floor2": "2F | MEDIA ROOM",
                "floor3": "3F | LIFESTYLE CURATION",
                "floor4": "4F | CULTURE TALK",
                "floor5": "5F | FASHION ARCHIVE",
                "floor6": "6F | LOCAL HERITAGE",
                "tickets": "Tickets",
                "art": "Art Collection",
                "travel": "Local Travel",
                "sound_on": "Sound On",
                "sound_off": "Sound Off",
                "search": "Search",
                "language": "Language"
            },
            "category": {
                "trend": {
                    "title": "K-Trend / Pop-up",
                    "description": "The fastest and hottest K-Culture trends"
                },
                "tickets": {
                    "title": "Performance / Exhibition",
                    "description": "A stage with emotion and thrill, time to meet art"
                },
                "art": {
                    "title": "Activity / Style",
                    "description": "Harmony of Activity and Style"
                },
                "style": {
                    "title": "Photo / Video",
                    "description": "Creative visual arts and media"
                },
                "travel": {
                    "title": "Local / Travel",
                    "description": "Finding hidden beauty in every corner of Korea"
                },

                "community": {
                    "title": "Community",
                    "description": "Space to share tastes and enjoy together"
                }
            },
            "hero": {
                "title": "Discover the Beauty of Korea",
                "subtitle": "Where Tradition Meets Modernity, department",
                "cta": "Explore Floors",
                "tagline": "Korean Heritage x Modern Space",
                "title_main": "DEPARTMENT",
                "title_sub": "OF K-CULTURE",
                "description": "Reinterpretation of space where tradition and modernity harmonize. Inspired by our heritage, we propose forward-thinking experiences.",
                "warping": "Warping...",
                "explore": "Explore Collection",
                "story": "Brand Story",
                "arrived": "Arrived at Virtual Space",
                "welcome": "Welcome to the Virtual Gateway",
                "start": "Start"
            },
            "subcategory": {
                "global": "Global Trends",
                "window": "Digital Show Window",
                "f1_kpop": "K-Pop Stage",
                "f1_library": "Trend Library",
                "f1_tech": "K-Wave Tech Zone",
                "sync": "Synergy Space",
                "pop": "Dynamic Pop-up",
                "f2_lab": "Brand Lab",
                "f2_art": "Art Collaboration",
                "f2_gallery": "Limited Edition Gallery",
                "performance": "Live Performance",
                "exhibit": "Virtual Exhibition",
                "f3_media": "Media Art Hall",
                "f3_lounge": "Artist Lounge",
                "f3_audio": "Sound Archive",
                "talk": "Cultural Discourse",
                "interview": "Artist Interview",
                "f4_plus": "Talk Plus",
                "f4_book": "Library Section",
                "f4_seminar": "Seminar Room",
                "archive": "Fashion Archive",
                "collection": "Season Collection",
                "f5_material": "Material Library",
                "f5_fitting": "Fitting Studio",
                "f5_textile": "Textile Room",
                "heritage": "Local Cultural Heritage",
                "travel": "Strategic Anchor",
                "f6_gourmet": "Gourmet Archive",
                "f6_craft": "Local Craft Center",
                "f6_tour": "Heritage Tour"
            },
            "subcategory_desc": "Exploring records of new inspiration found at the intersection of traditional depth and modern sense.",
            "subcategory_guide": "Click the 3D virtual space preview below to start an immersive search across time and space.",
            "subcategory_msg": {
                "global": "Survey the global K-culture trends and contemporary sensibilities that have captivated the world.",
                "window": "A new visual experience of brands encountered in a virtual space blending technology and art.",
                "f1_kpop": "Record and share the essence of K-pop, filled with the heat of the stage and the passion of artists.",
                "f1_library": "Discover new inspiration through archives that record contemporary tastes and trends.",
                "f1_tech": "Showcasing technical challenges and innovative media art leading the expansion of Hallyu culture.",
                "sync": "Record the creative exchange where different values meet to create a new harmony.",
                "pop": "Gathered the leading pieces of constantly changing and moving trends.",
                "f2_lab": "Explore the process where brand philosophy and values are completed through experimental attempts.",
                "f2_art": "Meet an original artistic world created by artists and brands breaking boundaries together.",
                "f2_gallery": "Curating special collections with unique rarity and value found nowhere else in the world.",
                "performance": "Vivid records of performances that capture the air and shouts of that day.",
                "exhibit": "An archive of artistic emotion met across time and space beyond physical constraints.",
                "f3_media": "Experience the fantastic media art system created by light and sound with your whole body.",
                "f3_lounge": "Hear special stories of artists in a space where creators' agony and inspiration dwell.",
                "f3_audio": "Explore auditory inspiration through sound records left in our memories.",
                "talk": "A space where insightful conversations and discussions deepen the cultural understanding.",
                "interview": "Capturing the honest and deep voices of artists hidden beyond their works.",
                "f4_plus": "A special interactive platform where knowledge expands and inspiration is exchanged.",
                "f4_book": "Deeply indulge in curated books imbued with the wisdom of the ages and artistic sense.",
                "f4_seminar": "A place of reflection and intellectual exchange where value is added by learning and sharing together.",
                "archive": "Highlighting the artistic value of fashion through records of timeless style.",
                "collection": "The complete form of the most sophisticated style reflecting seasonal changes and contemporary sense.",
                "f5_material": "Explore the essence of various materials and textures that form the basis of artistic expression.",
                "f5_fitting": "A creative space to complete your own style and directly experience artistic sense.",
                "f5_textile": "Offers infinite possibilities and visual pleasure created by delicate threads and weaving techniques.",
                "heritage": "Re-examining unique local cultural heritage with the depth of time through a modern lens.",
                "travel": "Explore strategic spaces that connect the charm of the region and serve as a starting point for new journeys.",
                "f6_gourmet": "Providing an experience that awakens the senses through gourmet culture filled with local flavors and scents.",
                "f6_craft": "Suggesting the beauty of Korean crafts in a modern way, imbued with the craftsmanship and sincerity and soul.",
                "f6_tour": "A journey of history and culture following the hidden gem-like stories of the region."
            },
            "featured": {
                "title": "Featured & Events",
                "subtitle": "Special Experiences at Culture Dept.",
                "no_content": "No content registered yet."
            },
            "about": {
                "title": "A Living Exhibition, department",
                "subtitle": "An Art Gallery Mall where profound heritage meets modern aesthetic.",
                "description1": "Beyond a traditional retail space, department is a premium cultural curation platform designed to inspire your everyday life.",
                "description2": "From the trendiest K-Culture to timeless heritage, we curate sophisticated exhibitions and artistic experiences that captivate your senses.",
                "cta": "Discover Our Philosophy"
            },
            "auth": {
                "login": "Login",
                "register": "Sign Up",
                "email": "Email",
                "password": "Password",
                "name": "Name",
                "logout": "Logout",
                "welcome": "Welcome",
                "login_title": "Login",
                "register_title": "Sign Up",
                "no_account": "Don't have an account?",
                "have_account": "Already have an account?",
                "signup": "Sign Up",
                "submit": "Submit",
                "loading": "Processing...",
                "error_generic": "An error occurred.",
                "forgot_password": "Forgot Password",
                "find_id": "Find ID",
                "reset_password_sent": "Password reset email has been sent.",
                "find_email_success": "Your email is {{email}}.",
                "find_email_not_found": "No account found with this information.",
                "social_login": "Social Login",
                "google_login": "Continue with Google",
                "signup_success_check_email": "Signup successful! Please check your email to confirm your account.",
                "rate_limit_exceeded": "Too many requests. Please try again later."
            },
            "footer": {
                "address": "123 Sogong-ro, Jung-gu, Seoul",
                "copyright": "© 2026 Culture Dept. Store. All rights reserved.",
                "privacy": "Privacy Policy",
                "terms": "Terms of Service",
                "shop": "SHOP",
                "support": "SUPPORT",
                "contact": "CONTACT",
                "description": "A premium cultural platform promoting Korea's beautiful culture and arts to the world.",
                "notice": "Notice",
                "faq": "FAQ",
                "inquiry": "1:1 Inquiry",
                "weekdays": "Weekdays 10:00 - 18:00 (Closed on weekends/holidays)"
            },
            "common": {
                "view_all": "View All",
                "view_details": "View Details",
                "date": "Date",
                "location": "Location",
                "price": "Price",
                "loading": "Loading...",
                "error": "An error occurred.",
                "no_content": "No content available.",
                "back_home": "Go Home",
                "back": "Back",

                "share": "Share",
                "duration": "Duration",
                "duration_value": "Approx. 90 mins",
                "detail_intro": "Details",
                "share_modal": {
                    "title": "Share",
                    "copy_link": "Copy Link",
                    "copied": "Link Copied!",
                    "sns": {
                        "kakao": "KakaoTalk",
                        "facebook": "Facebook",
                        "twitter": "Twitter",
                        "more": "More"
                    }
                },
                "close": "Close",
                "download": "Download",
                "register_product": "Register Product",
                "guest": "Guest",
                "not_found": "Category Not Found",
                "not_found_desc": "The requested page does not exist or is currently being prepared.",
                "go_inspiration": "Back to Inspiration",
                "no_info": "No Information",
                "loading_content": "Loading contents..."
            },
            "search": {
                "placeholder": "Enter search term...",
                "no_results": "No results found.",
                "results_for": "Search results for '{{query}}'",
                "close": "Close"
            },
            "admin": {
                "sidebar": {
                    "title": "Store Admin",
                    "products": "Products",
                    "users": "Users",
                    "bookings": "Bookings",
                    "logout": "Sign Out"
                },
                "product": {
                    "title": "Product Management",
                    "add": "Add Product",
                    "edit": "Edit Product",
                    "delete_confirm": "Are you sure you want to delete this product?",
                    "search_placeholder": "Search by title...",
                    "table": {
                        "image": "Image",
                        "title": "Title",
                        "category": "Category",
                        "price": "Price",
                        "actions": "Actions"
                    },
                    "form": {
                        "basic_info": "Basic Info",
                        "content_details": "Content Details",
                        "image_label": "Product Image",
                        "video_label": "YouTube Video URL (Optional)",
                        "main_category": "Main Category (Floor)",
                        "sub_category": "Sub Category",
                        "manage_closed": "Manage Closed Days",
                        "closed_description": "Click on dates to toggle them as closed days. Red indicates closed.",
                        "selected_closed": "Selected Closed Days",
                        "no_closed": "No closed days selected.",
                        "save": "Save Product",
                        "saving": "Saving...",
                        "upload_image": "Upload Image",
                        "uploading": "Uploading...",
                        "replace_image": "Replace Image",
                        "closed_day": "Closed Day",
                        "open_day": "Open Day"
                    }
                },
                "user": {
                    "title": "User Management",
                    "subtitle": "Management of all users and permissions",
                    "search_placeholder": "Search name or email",
                    "table": {
                        "user": "User",
                        "email": "Email",
                        "role": "Role",
                        "actions": "Actions"
                    },
                    "promote": "Promote",
                    "demote": "Demote",
                    "delete": "Delete",
                    "no_users": "No users found."
                },
                "booking": {
                    "title": "Bookings & Settlements",
                    "filter": {
                        "status": "Status",
                        "payment": "Payment Method",
                        "search": "Search (Email)",
                        "from": "From Date",
                        "to": "To Date",
                        "all_status": "All Status",
                        "all_methods": "All Methods"
                    },
                    "table": {
                        "date": "Date",
                        "user": "User",
                        "product": "Product / Category",
                        "payment": "Payment",
                        "amount": "Amount",
                        "settlement": "Settlement (90%)",
                        "status": "Status / Settlement",
                        "actions": "Admin Actions"
                    },
                    "settle": "Settle",
                    "settle_confirm": "Are you sure you want to settle this payment? This will calculate a 10% commission.",
                    "settle_error": "Failed to settle booking.",
                    "settled": "Settled",
                    "pending_settle": "Pending"
                }
            }
        }
    },
    ja: {
        translation: {
            "floor_guide": "フロアガイド",
            "floor_guide_subtitle": "Floor Guide",
            "nav": {
                "about": "紹介",
                "store": "ストア",
                "gallery": "Department",
                "floor1": "1F | K-CULTURE TRENDS",
                "floor2": "2F | MEDIA ROOM",
                "floor3": "3F | LIFESTYLE CURATION",
                "floor4": "4F | CULTURE TALK",
                "floor5": "5F | FASHION ARCHIVE",
                "floor6": "6F | LOCAL HERITAGE",

                "notice": "お知らせ",
                "qna": "Q&A",
                "reviews": "レビュー",
                "mypage": "マイページ",
                "login": "ログイン",
                "tickets": "チケット予約",
                "art": "アートコレクション",
                "travel": "ローカル旅行",
                "sound_on": "音声をオンにする",
                "sound_off": "音声をオフにする",
                "search": "検索",
                "language": "言語"
            },
            "category": {
                "trend": {
                    "title": "トレンド / ポップアップ",
                    "description": "最速でホットなK-カルトレンド"
                },
                "tickets": {
                    "title": "公演 / 展示",
                    "description": "感動と戦慄のある舞台、芸術に出会う時間"
                },
                "art": {
                    "title": "アート / スタイル",
                    "description": "芸術とスタイルの調和"
                },
                "style": {
                    "title": "写真 / 映像",
                    "description": "創造的な視覚芸術とメディア"
                },
                "travel": {
                    "title": "ローカル / 旅行",
                    "description": "大韓民国の隅々、隠された美しさを探して"
                },

                "community": {
                    "title": "コミュニティ",
                    "description": "好みを分かち合い、一緒に楽しむ空間"
                }
            },
            "hero": {
                "title": "韓国の美、現代的な感覚で出会う",
                "subtitle": "伝統と現代が共存する複合文化空間, department",
                "cta": "フロアガイドを見る",
                "tagline": "韓国の遺産と現代的空間",
                "title_main": "デパートメント",
                "title_sub": "OF K-CULTURE",
                "description": "伝統と現代が調和した新しい空間の再解釈。私たちの遺産からインスピレーションを得て、時代を先取りする体験を提案します。",
                "warping": "ワーピング中...",
                "explore": "コレクションを見る",
                "story": "ブランドストーリー",
                "arrived": "仮想空間に到着しました",
                "welcome": "Welcome to the Virtual Gateway",
                "start": "開始する"
            },
            "subcategory": {
                "global": "グローバルトレンド",
                "window": "デジタルショーウィンドウ",
                "f1_kpop": "K-POPステージ",
                "f1_library": "トレンドライブラリ",
                "f1_tech": "韓流テックゾーン",
                "sync": "シナジー空間",
                "pop": "ダイナミックポップアップ",
                "f2_lab": "ブランドラボ",
                "f2_art": "アートコラボ",
                "f2_gallery": "限定版ギャラリー",
                "performance": "公演実況",
                "exhibit": "仮想展示",
                "f3_media": "メディアアートホール",
                "f3_lounge": "アーティストラウンジ",
                "f3_audio": "サウンドアーカイブ",
                "talk": "文化談論",
                "interview": "アーティストインタビュー",
                "f4_plus": "トークプラス",
                "f4_book": "図書館セクション",
                "f4_seminar": "セミナールーム",
                "archive": "ファッションアーカイブ",
                "collection": "シーズンコレクション",
                "f5_material": "素材ライ브러리",
                "f5_fitting": "フィッティングスタジオ",
                "f5_textile": "テキスタイルルーム",
                "heritage": "地域文化遺産",
                "travel": "戦略的アンカー",
                "f6_gourmet": "美食アーカイブ",
                "f6_craft": "地域工芸館",
                "f6_tour": "ヘリテージツアー"
            },
            "subcategory_desc": "伝統の深みと現代的な感覚が交差하는 지점에서 발견한 새로운 영감의 기록들을 탐색합니다.",
            "subcategory_guide": "下部の3D仮想空間プレビューをクリックして、時空を超えた没入型検索を開始してください。",
            "subcategory_msg": {
                "global": "世界を魅료시킨 K-컬처の流れと、同時代的な感性を一望します。",
                "window": "技術と芸術が融合した仮想空間で出会う、新しいブランドの視覚的体験です。",
                "f1_kpop": "ステージの熱気とアーティストの情熱が込められたK-POPの精髄を記録し、共有します。",
                "f1_library": "同時代の好みと流行を記録したアーカイブを通じて、新しいインスピレーションを発見します。",
                "f1_tech": "韓流文化の拡散を牽引する技術的挑戦と、革新的なメディアアートを披露します。",
                "sync": "異なる価値が出会い、新しい調和を生み出す創造的な交流の現場を記録します。",
                "pop": "絶えず変化し動き続けるトレンドの、最先端の断片を集めました。",
                "f2_lab": "ブランドの哲学と価値が、実験的な試みを通じて完成されていく過程を探索します。",
                "f2_art": "芸術家とブランドが出会い、境界を越えて創造した独創的な芸術の世界に触れます。",
                "f2_gallery": "世界に一つだけの希少性と価値を持つ、特別なコレクションをキュレーションします。",
                "performance": "その日の空気や歓声までそのまま閉じ込めた、躍動感あふれる公演の記録です。",
                "exhibit": "物理的な制約を超え、時空を越えて出会う芸術的感動のアーカイブです。",
                "f3_media": "光と音が織り成す幻想的なメディアアートシステムを、全身で体感します。",
                "f3_lounge": "創作者の苦悩とインスピレーションが宿る空間で、アーティストの特別な物語を聞きます。",
                "f3_audio": "私たちの記憶に残された音の記録を通じて、聴覚的なインスピレーションを探求します。",
                "talk": "文化の深みを加える洞察に満ちた対話と議論が続く空間です。",
                "interview": "作品の向こう側に隠された、率直で深いアーティストの声をお届けします。",
                "f4_plus": "知識の拡張とインスピレーションの交流が生まれる、特別なインタラクティブプラットフォームです。",
                "f4_book": "年月の知恵と芸術的感性が息づくキュレーション書籍を、深く堪能します。",
                "f4_seminar": "共に学び分かち合うことで価値が高まる、省察と知的交流の場です。",
                "archive": "時代を超越したスタイルの記録を通じて、ファッションが持つ芸術的価値を照らします。",
                "collection": "季節の移ろいと時代の感性を捉えた、最も洗練されたスタイルの完成形です。",
                "f5_material": "芸術的表現の基礎となる、多様な素材とテクスチャの本質を探求します。",
                "f5_fitting": "自分だけのスタイルを完成させ、芸術的感性を直接体験する創造的な空間です。",
                "f5_textile": "繊細な糸と織り技術が生み出す無限の可能性と、視覚的な喜びを提供します。",
                "heritage": "時の深さをたたえた地域固有の文化遺産を、現代的な視点で再解釈します。",
                "travel": "新しい旅の起点であり、地域の魅力をつなぐ戦略的な空間を探索します。",
                "f6_gourmet": "地域の味と香りが詰まった美食文化を通じて、五感を呼び覚ます体験を提供します。",
                "f6_craft": "職人の技と真心が込められた韓国工芸の美しさを、現代的に提案します。",
                "f6_tour": "地域の隠れた宝石のような物語を辿る、歴史と文化の旅です。"
            },
            "featured": {
                "title": "おすすめ & イベント",
                "subtitle": "Culture Dept.で出会う特別な体験",
                "no_content": "登録されたコンテンツがありません。"
            },
            "about": {
                "title": "好みが息づく空間、department",
                "subtitle": "伝統の深みと現代の感覚が交差するアートギャラリーデパート",
                "description1": "departmentは単なる消費空間を超え、日常にインスピレーションを吹き込むプレミアム文化キュレーションプラットフォームです。",
                "description2": "最もトレンディなグローバルG-カルチャーから歳月の深みを抱くヘリテージまで、あなたの視線を引きつける質の高い展示と芸術的体験を提供します。",
                "cta": "ブランド哲学を見る"
            },
            "auth": {
                "login": "ログイン",
                "register": "新規登録",
                "email": "メールアドレス",
                "password": "パスワード",
                "name": "名前",
                "logout": "ログアウト",
                "welcome": "ようこそ",
                "login_title": "ログイン",
                "register_title": "新規登録",
                "no_account": "アカウントをお持ちでないですか？",
                "have_account": "すでにアカウントをお持ちですか？",
                "signup": "登録する",
                "submit": "確認",
                "loading": "処理中...",
                "error_generic": "エラーが発生しました。",
                "social_login": "簡単ログイン",
                "google_login": "Googleで続行",
                "signup_success_check_email": "登録が完了しました！メールを確認してアカウントを認証してください。",
                "rate_limit_exceeded": "リクエストが多すぎます。しばらくしてからもう一度お試しください。"
            },
            "footer": {
                "address": "ソウル特別市中区小公路123",
                "copyright": "© 2026 Culture Dept. Store. All rights reserved.",
                "privacy": "プライバシーポリシー",
                "terms": "利用規約",
                "shop": "SHOP",
                "support": "SUPPORT",
                "contact": "CONTACT",
                "description": "大韓民国の美しい文化と芸術を世界に知らせるプレミアム文化プラットフォームです。",
                "notice": "お知らせ",
                "faq": "よくある質問",
                "inquiry": "1:1 お問い合わせ",
                "weekdays": "平日 10:00 - 18:00 (週末/祝日休み)"
            },
            "common": {
                "view_all": "すべて見る",
                "view_details": "詳細を見る",
                "date": "期間",
                "location": "場所",
                "price": "価格",
                "loading": "読み込み中...",
                "error": "エラーが発生しました。",
                "no_content": "コンテンツがありません。",
                "back_home": "ホームへ",
                "back": "戻る",
                "booking": "予約する",
                "share": "共有する",
                "duration": "所要時間",
                "duration_value": "約90分",
                "detail_intro": "詳細紹介",
                "download": "ダウンロード",
                "register_product": "商品登録",
                "not_found": "カテゴリーが見つかりません",
                "not_found_desc": "リクエストされたページが存在しないか、現在準備中です。",
                "go_inspiration": "インスピレーションホームへ",
                "no_info": "情報なし",
                "loading_content": "コンテンツを読み込み中..."
            },
            "search": {
                "placeholder": "検索語を入力してください...",
                "no_results": "検索結果がありません。",
                "results_for": "'{{query}}'の検索結果",
                "close": "閉じる"
            }
        }
    },
    zh: {
        translation: {
            "floor_guide": "楼层指南",
            "floor_guide_subtitle": "Floor Guide",
            "nav": {
                "about": "介绍",
                "store": "商店",
                "gallery": "Department",
                "floor1": "1F | K-CULTURE TRENDS",
                "floor2": "2F | MEDIA ROOM",
                "floor3": "3F | LIFESTYLE CURATION",
                "floor4": "4F | CULTURE TALK",
                "floor5": "5F | FASHION ARCHIVE",
                "floor6": "6F | LOCAL HERITAGE",

                "notice": "公告",
                "qna": "问答",
                "reviews": "评论",
                "mypage": "个人中心",
                "login": "登录",
                "tickets": "门票预订",
                "art": "艺术收藏",
                "travel": "本地旅游",
                "sound_on": "开启声音",
                "sound_off": "关闭声音",
                "search": "搜索",
                "language": "语言"
            },
            "category": {
                "trend": {
                    "title": "流行趋势 / 快闪店",
                    "description": "最快最热的K-Culture趋势"
                },
                "tickets": {
                    "title": "演出 / 展览",
                    "description": "充满感动和战栗的舞台，与艺术相遇的时间"
                },
                "art": {
                    "title": "艺术 / 风格",
                    "description": "艺术与风格的和谐"
                },
                "style": {
                    "title": "照片 / 视频",
                    "description": "创意视觉艺术和媒体"
                },
                "travel": {
                    "title": "本地 / 旅游",
                    "description": "寻找韩国各个角落隐藏的美丽"
                },

                "community": {
                    "title": "社区",
                    "description": "分享喜好并一起享受的空间"
                }
            },
            "hero": {
                "title": "以现代感邂逅韩国之美",
                "subtitle": "传统与现代共存的综合文化空间, department",
                "cta": "查看楼层指南",
                "tagline": "韩国遗产与现代空间",
                "title_main": "DEPARTMENT",
                "title_sub": "OF K-CULTURE",
                "description": "传统与现代融合的全新空间诠释。从我们的遗产中汲取灵感，为您带来领先时代的体验。",
                "warping": "正在进入...",
                "explore": "浏览系列",
                "story": "品牌故事",
                "arrived": "已抵达虚拟空间",
                "welcome": "Welcome to the Virtual Gateway",
                "start": "开始"
            },
            "subcategory": {
                "global": "全球趋势",
                "window": "数字橱窗",
                "f1_kpop": "K-Pop 舞台",
                "f1_library": "趋势图书馆",
                "f1_tech": "韩流科技区",
                "sync": "协同空间",
                "pop": "动态快闪店",
                "f2_lab": "品牌实验室",
                "f2_art": "艺术协作",
                "f2_gallery": "限量版画廊",
                "performance": "演出实况",
                "exhibit": "虚拟展览",
                "f3_media": "媒体艺术厅",
                "f3_lounge": "艺术家休息室",
                "f3_audio": "声音档案馆",
                "talk": "文化讨论",
                "interview": "艺术家采访",
                "f4_plus": "对话 Plus",
                "f4_book": "图书馆板块",
                "f4_seminar": "研讨室",
                "archive": "时尚档案馆",
                "collection": "季度系列",
                "f5_material": "材料图书馆",
                "f5_fitting": "试衣工作室",
                "f5_textile": "纺织室",
                "heritage": "地方文化遗产",
                "travel": "战略锚点",
                "f6_gourmet": "美食档案馆",
                "f6_craft": "地方工艺馆",
                "f6_tour": "遗产之旅"
            },
            "subcategory_desc": "探索在传统深度与现代感官交汇点发现的新灵感记录。",
            "subcategory_guide": "点击下方的3D虚拟空间预览，开始跨越时空的沉浸式搜索。",
            "subcategory_msg": {
                "global": "一览风靡全球的 K-Culture 潮流趋势与当代感官。",
                "window": "在结合技术与艺术的虚拟空间中，体验品牌的全新视觉盛宴。",
                "f1_kpop": "记录并分享蕴含舞台热度与艺术家激情的 K-Pop 精髓。",
                "f1_library": "通过记录当代品味与流行的档案，挖掘全新的灵感。",
                "f1_tech": "展示引领韩流文化传播的技术挑战与创新媒体艺术。",
                "sync": "记录不同价值相遇、创造全新和谐的创意交流现场。",
                "pop": "汇聚了不断变化与流动的潮流趋势中最前沿的片段。",
                "f2_lab": "探索品牌哲学与价值通过实验性尝试走向完善的过程。",
                "f2_art": "领略艺术家与品牌跨越边界共同创造的独创艺术世界。",
                "f2_gallery": "策划具有全球唯一稀缺性与价值的特别收藏系列。",
                "performance": "生动记录捕捉了当天的空气与呐喊的演出实况。",
                "exhibit": "超越物理限制，在跨越时空的档案中相遇的艺术感动。",
                "f3_media": "全身心体验由光影与声音交织而成的幻妙媒体艺术系统。",
                "f3_lounge": "在创作者的苦恼与灵感驻足的空间，聆听艺术家的特别故事。",
                "f3_audio": "通过留在记忆中的声音记录，探求听觉灵感。",
                "talk": "这是一个展现文化深度、持续进行深刻对话与讨论的空间。",
                "interview": "收录了隐藏在作品背后，艺术家坦率而深邃的声音。",
                "f4_plus": "一个知识扩展与灵感交流迸发的特别互动平台。",
                "f4_book": "深度沉浸在蕴含岁月智慧与艺术感官的策划图书中。",
                "f4_seminar": "一个通过共同学习与分享提升价值的省察与智力交流场所。",
                "archive": "通过跨越时代的风格记录，展现时尚所蕴含的艺术价值。",
                "collection": "捕捉季节更替与时代感官，呈现最干练风格的完成形态。",
                "f5_material": "探求作为艺术表达基础的多种材料与纹理的本质。",
                "f5_fitting": "这是一个完善个人风格、直接体验艺术感官的创意空间。",
                "f5_textile": "展现由细腻丝线与编织技术创造的无限可能与视觉愉悦。",
                "heritage": "以现代视角重新审视蕴含时间厚度的地域固有文化遗产。",
                "travel": "探索连接地域魅力并作为新旅程起点的战略性空间。",
                "f6_gourmet": "通过蕴含地域风味与香气的精品美食文化，唤醒感官体验。",
                "f6_craft": "以现代方式呈献蕴含匠人手艺与诚意的韩国工艺之美。",
                "f6_tour": "追寻地域隐藏的瑰宝般故事的历史与文化之旅。"
            },
            "featured": {
                "title": "推荐 & 活动",
                "subtitle": "在 Culture Dept. 遇见的特别体验",
                "no_content": "暂无已注册的内容。"
            },
            "about": {
                "title": "品味焕发生机的空间，department",
                "subtitle": "传统底蕴与现代感官交汇的艺术画廊百货",
                "description1": "department 超越了单纯的消费空间，是为日常生活注入灵感的高端文化内容策展平台。",
                "description2": "从最前沿的全球G-Culture到承载岁月厚重的文化遗产，我们为您提供引人入胜的高水准展览与艺术体验。",
                "cta": "探索品牌理念"
            },
            "auth": {
                "login": "登录",
                "register": "注册",
                "email": "电子邮箱",
                "password": "密码",
                "name": "姓名",
                "logout": "登出",
                "welcome": "欢迎",
                "login_title": "登录",
                "register_title": "注册",
                "no_account": "没有账号？",
                "have_account": "已有账号？",
                "signup": "注册",
                "submit": "确认",
                "loading": "处理中...",
                "error_generic": "发生错误。",
                "social_login": "快捷登录",
                "google_login": "使用 Google 继续",
                "signup_success_check_email": "注册成功！请检查您的电子邮件以确认您的帐户。",
                "rate_limit_exceeded": "请求过多。请稍后再试。"
            },
            "footer": {
                "address": "首尔特别市中区小公路123",
                "copyright": "© 2026 Culture Dept. Store. All rights reserved.",
                "privacy": "隐私政策",
                "terms": "使用条款",
                "shop": "SHOP",
                "support": "SUPPORT",
                "contact": "CONTACT",
                "description": "向世界传播韩国美丽文化和艺术的高级文化平台。",
                "notice": "公告",
                "faq": "常见问题",
                "inquiry": "1:1 咨询",
                "weekdays": "平日 10:00 - 18:00 (周末/节假日休息)"
            },
            "common": {
                "view_all": "查看全部",
                "view_details": "查看详情",
                "date": "日期",
                "location": "地点",
                "price": "价格",
                "loading": "加载中...",
                "error": "发生错误。",
                "no_content": "没有内容。",
                "back_home": "返回首页",
                "back": "返回",
                "booking": "预订",
                "share": "分享",
                "duration": "所需时间",
                "duration_value": "约90分钟",
                "detail_intro": "详细介绍",
                "download": "下载",
                "register_product": "注册商品",
                "not_found": "未找到分类",
                "not_found_desc": "所请求的页面不存在或正在准备中。",
                "go_inspiration": "返回灵感首页",
                "no_info": "暂无信息",
                "loading_content": "正在加载内容..."
            },
            "search": {
                "placeholder": "请输入搜索词...",
                "no_results": "没有找到搜索结果。",
                "results_for": "'{{query}}'的搜索结果",
                "close": "关闭"
            }
        }
    },
    fr: { translation: {} },
    de: { translation: {} },
    es: { translation: {} },
    it: { translation: {} },
    ru: { translation: {} },
    pt: { translation: {} },
    nl: { translation: {} },
    pl: { translation: {} },
    sv: { translation: {} },
    ar: { translation: {} },
    tr: { translation: {} },
    fa: { translation: {} },
    he: { translation: {} },
    vi: { translation: {} },
    th: { translation: {} },
    id: { translation: {} },
    hi: { translation: {} },
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
