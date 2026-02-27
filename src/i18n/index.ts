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
                "trend": "트렌드 / 문화 교류",
                "tickets": "공연 / 전시",
                "art": "활동 / 스타일",
                "style": "사진 / 영상",
                "travel": "지역 / 여행",
                "community": "커뮤니티",

                "global_k_culture": "글로벌 K-컬처",
                "modern_heritage": "전통의 현대화",
                "exchange_booth": "문화 교류 부스",
                "collab_project": "협업 프로젝트",
                "traditional_arts": "전통 예술",
                "media_arts": "현대 미디어 아트",
                "culture_class": "문화 체험 클래스",
                "global_k_style": "글로벌 K-스타일",
                "local_heritage": "지역 문화 유산",
                "travel_curation": "여행 큐레이션",

                "notice": "공지사항",
                "qna": "Q&A",
                "reviews": "후기"
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
                "promotion_cta": "문화 교류 알아보기"
            },
            "featured": {
                "title": "추천 & 이벤트",
                "subtitle": "Culture Dept.에서 만나는 특별한 경험",
                "no_content": "등록된 콘텐츠가 없습니다.",
                "event_ongoing": "진행 중인 이벤트",
                "event_upcoming": "진행 예정 이벤트",
                "event_archived": "종료된 이벤트",
                "event_ongoing_desc": "현재 진행 중인 특별한 이벤트입니다.",
                "event_upcoming_desc": "곳 만나볼 수 있는 특별한 이벤트입니다.",
                "event_archived_desc": "이미 종료된 이벤트입니다.",
                "ongoing": "진행 중",
                "upcoming": "예정",
                "archived": "종료",
                "no_events": "이벤트 없음",
                "no_events_desc": "이 날짜에는 예정된 이벤트가 없어요.",
                "back_to_recommendations": "전체 추천 보기",
                "monthly_recommendations": "이달의 추천",
                "image_pending": "이미지 등록 예정",
                "view_all": "전체 추천 보기"
            },
            "about": {
                "title": "문화의 시선, 교류의 중심",
                "subtitle": "전통과 현대, 그리고 당신을 잇는 가교",
                "description1": "department은 한국 문화의 정수를 발굴하고 세계와 공유하는 문화 홍보 및 교류의 전초기지입니다.",
                "description2": "단순한 홍보를 넘어, 깊이 있는 전시와 체험을 통해 우리 문화의 새로운 가치를 발견하고 교류의 가치를 실현합니다.",
                "cta": "문화 비전 보기"
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
            "artist": {
                "title": "올해의 아티스트 10인"
            },
            "calendar": {
                "title": "이달의 문화 달력",
                "event_desc": "선정된 일자에 진행되는 특별한 문화 행사를 놓치지 마세요.",
                "hover_hint": "날짜를 선택해 보세요"
            },
            "shorts": {
                "title": "실시간 현장 쇼츠"
            },
            "brand": {
                "title": "브랜드 스포트라이트"
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
                "guest": "게스트"
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
                "gallery": "Taste Gallery",
                "trend": "K-Trend / Pop-up",
                "tickets": "Tickets",
                "art": "Activity / Style",
                "style": "Photo / Video",
                "travel": "Local / Travel",

                "community": "Community",
                "popup": "Pop-up Store",
                "collab": "Collaboration",
                "new": "New Arrivals",
                "performance": "Performance",
                "exhibition": "Exhibition",
                "mypage": "My Page",
                "login": "Login",
                "global_k_culture": "Global K-Culture",
                "modern_heritage": "Modern Heritage",
                "exchange_booth": "Cultural Exchange",
                "collab_project": "Collaboration",
                "traditional_arts": "Traditional Arts",
                "media_arts": "Media Art",
                "culture_class": "Culture Class",
                "global_k_style": "Global K-Style",
                "local_heritage": "Local Heritage",
                "travel_curation": "Travel Curation"
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
                "cta": "Explore Floors"
            },
            "featured": {
                "title": "Featured & Events",
                "subtitle": "Special Experiences at Culture Dept.",
                "no_content": "No content registered yet.",
                "event_ongoing": "Ongoing Events",
                "event_upcoming": "Upcoming Events",
                "event_archived": "Past Events",
                "event_ongoing_desc": "A special event currently in progress.",
                "event_upcoming_desc": "A special event coming soon.",
                "event_archived_desc": "This event has already ended.",
                "ongoing": "Ongoing",
                "upcoming": "Upcoming",
                "archived": "Ended",
                "no_events": "No Events",
                "no_events_desc": "No events scheduled for this date.",
                "back_to_recommendations": "View All",
                "monthly_recommendations": "Monthly Picks",
                "image_pending": "Image Coming Soon",
                "view_all": "View All"
            },
            "about": {
                "title": "A Cultural Perspective, A Hub for Exchange",
                "subtitle": "A bridge connecting tradition, modernity, and you",
                "description1": "department is a cultural promotion and exchange outpost that discovers the essence of Korean culture and shares it with the world.",
                "description2": "Beyond simple promotion, we discover new values of our culture and realize the value of exchange through in-depth exhibitions and experiences.",
                "cta": "View Cultural Vision"
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
            "artist": {
                "title": "Top 10 Artists of the Year"
            },
            "calendar": {
                "title": "Cultural Calendar",
                "event_desc": "Don't miss the special cultural events on selected dates.",
                "hover_hint": "Select a date"
            },
            "shorts": {
                "title": "Live Shorts"
            },
            "brand": {
                "title": "Brand Spotlight"
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
                "guest": "Guest"
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
                "gallery": "趣向館",
                "trend": "トレンド / ポップアップ",
                "tickets": "公演 / 展示",
                "art": "アート / スタイル",
                "style": "写真 / 映像",
                "travel": "ローカル / 旅行",

                "community": "コミュニティ",
                "popup": "ポップアップストア",
                "collab": "コラボレーション",
                "new": "新商品",
                "performance": "公演",
                "exhibition": "展示",
                "booking": "予約",
                "class": "クラス",
                "fashion": "スタイル",
                "photo": "写真",
                "video": "映像",
                "media": "メディア",
                "local": "ローカル名所",
                "course": "おすすめコース",
                "guide": "ガイド",

                "notice": "お知らせ",
                "qna": "Q&A",
                "reviews": "レビュー",
                "mypage": "マイページ",
                "login": "ログイン",
                "global_k_culture": "グローバルK-カルチャー",
                "modern_heritage": "伝統の現代化",
                "exchange_booth": "文化交流ブース",
                "collab_project": "コラボプロジェクト",
                "traditional_arts": "伝統芸術",
                "media_arts": "メディアアート",
                "culture_class": "文化体験クラス",
                "global_k_style": "グローバルK-スタイル",
                "local_heritage": "地域文化遺産",
                "travel_curation": "旅行キュレーション"
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
                "cta": "フロアガイドを見る"
            },
            "featured": {
                "title": "おすすめ & イベント",
                "subtitle": "Culture Dept.で出会う特別な体験",
                "no_content": "登録されたコンテンツがありません。",
                "event_ongoing": "開催中のイベント",
                "event_upcoming": "開催予定のイベント",
                "event_archived": "終了したイベント",
                "event_ongoing_desc": "現在開催中の特別イベントです。",
                "event_upcoming_desc": "もうすぐお会いできる特別なイベントです。",
                "event_archived_desc": "すでに終了したイベントです。",
                "ongoing": "開催中",
                "upcoming": "予定",
                "archived": "終了",
                "no_events": "イベントなし",
                "no_events_desc": "この日にはイベントがありません。",
                "back_to_recommendations": "全体を見る",
                "monthly_recommendations": "今月のおすすめ",
                "image_pending": "画像準備中",
                "view_all": "全体を見る"
            },
            "about": {
                "title": "文化の視点、交流の中心",
                "subtitle": "伝統と現代、そしてあなたをつなぐ架け橋",
                "description1": "departmentは韓国文化の精髄を発掘し世界と共有する文化広報および交流の前哨基地です。",
                "description2": "単なる広報を超え、深い展示と体験を通じて私たちの文化の新たな価値を発見し、交流の価値を実現します。",
                "cta": "文化ビジョンを見る"
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
            "artist": {
                "title": "今年のアーティスト10人"
            },
            "calendar": {
                "title": "今月の文化カレンダー",
                "event_desc": "選択された日程で行われる特別な文化イベントをお見逝しなく。",
                "hover_hint": "日付を選択してください"
            },
            "shorts": {
                "title": "ライブショート"
            },
            "brand": {
                "title": "ブランドスポットライト"
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
                "register_product": "商品登録"
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
                "gallery": "趣味馆",
                "trend": "流行趋势 / 快闪店",
                "tickets": "演出 / 展览",
                "art": "艺术 / 风格",
                "style": "照片 / 视频",
                "travel": "本地 / 旅游",

                "community": "社区",
                "popup": "快闪店",
                "collab": "合作",
                "new": "新商品",
                "performance": "演出",
                "exhibition": "展览",
                "booking": "预订",
                "class": "课程",
                "fashion": "风格",
                "photo": "照片",
                "video": "视频",
                "media": "媒体",
                "local": "本地名胜",
                "course": "推荐路线",
                "guide": "指南",

                "notice": "公告",
                "qna": "问答",
                "reviews": "评论",
                "mypage": "个人中心",
                "login": "登录",
                "global_k_culture": "全球K-文化",
                "modern_heritage": "传统的现代化",
                "exchange_booth": "文化交流展台",
                "collab_project": "合作项目",
                "traditional_arts": "传统艺术",
                "media_arts": "现代媒体艺术",
                "culture_class": "文化体验课程",
                "global_k_style": "全球K-风格",
                "local_heritage": "地方文化遗产",
                "travel_curation": "旅行策展"
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
                "cta": "查看楼层指南"
            },
            "featured": {
                "title": "推荐 & 活动",
                "subtitle": "在 Culture Dept. 遇见的特别体验",
                "no_content": "暂无已注册的内容。",
                "event_ongoing": "进行中的活动",
                "event_upcoming": "即将举行的活动",
                "event_archived": "已结束的活动",
                "event_ongoing_desc": "正在进行中的特别活动。",
                "event_upcoming_desc": "即将与您见面的特别活动。",
                "event_archived_desc": "该活动已经结束。",
                "ongoing": "进行中",
                "upcoming": "即将",
                "archived": "已结束",
                "no_events": "暂无活动",
                "no_events_desc": "这个日期没有预定的活动。",
                "back_to_recommendations": "查看全部",
                "monthly_recommendations": "本月推荐",
                "image_pending": "图片即将上传",
                "view_all": "查看全部"
            },
            "about": {
                "title": "文化的视角，交流的中心",
                "subtitle": "连接传统、现代和您的桥梁",
                "description1": "department是一个发掘韩国文化精髄并与世界分享的文化推广与交流前哨基地。",
                "description2": "超越单纯的推广，通过深入的展览和体验，发现我们文化的新价值，实现交流的价值。",
                "cta": "查看文化愿景"
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
            "artist": {
                "title": "年度十大艺术家"
            },
            "calendar": {
                "title": "本月文化日历",
                "event_desc": "不要错过在选定日期举行的特别文化活动。",
                "hover_hint": "选择日期查看"
            },
            "shorts": {
                "title": "现场短视频"
            },
            "brand": {
                "title": "品牌聚焦"
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
                "register_product": "注册商品"
            },
            "search": {
                "placeholder": "请输入搜索词...",
                "no_results": "没有找到搜索结果。",
                "results_for": "'{{query}}'的搜索结果",
                "close": "关闭"
            }
        }
    },
    th: {
    "translation": {
        "floor_guide": "แผนผังชั้น",
        "floor_guide_subtitle": "Floor Guide",
        "nav": {
            "about": "เกี่ยวกับ",
            "store": "ร้านค้า",
            "gallery": "แกลลอรี่",
            "trend": "เทรนด์ / ป๊อปอัป",
            "tickets": "การแสดง / นิทรรศการ",
            "art": "กิจกรรม / สไตล์",
            "style": "รูปภาพ / วิดีโอ",
            "travel": "ท้องถิ่น / ท่องเที่ยว",
            "community": "ชุมชน",
            "popup": "ป๊อปอัปสโตร์",
            "collab": "ทำงานร่วมกัน",
            "new": "มาใหม่",
            "performance": "การแสดง",
            "exhibition": "นิทรรศการ",
            "booking": "การจอง",
            "class": "คลาส",
            "fashion": "แฟชั่น",
            "photo": "รูปภาพ",
            "video": "วิดีโอ",
            "media": "สื่อ",
            "local": "สถานที่ท้องถิ่น",
            "course": "เส้นทางแนะนำ",
            "guide": "ไกด์",
            "notice": "ประกาศ",
            "qna": "ถาม-ตอบ",
            "reviews": "รีวิว",
            "mypage": "หน้าของฉัน",
            "login": "เข้าสู่ระบบ",
            "global_k_culture": "โกลบอล เค-คัลเจอร์",
            "modern_heritage": "มรดกสมัยใหม่",
            "exchange_booth": "บูธแลกเปลี่ยนวัฒนธรรม",
            "collab_project": "โปรเจกต์ความร่วมมือ",
            "traditional_arts": "ศิลปะดั้งเดิม",
            "media_arts": "มีเดียอาร์ต",
            "culture_class": "คลาสวัฒนธรรม",
            "global_k_style": "โกลบอล เค-สไตล์",
            "local_heritage": "มรดกท้องถิ่น",
            "travel_curation": "การท่องเที่ยวคัดสรร"
        },
        "category": {
            "trend": {
                "title": "เทรนด์ / ป๊อปอัป",
                "description": "เทรนด์ K-Culture ที่เร็วที่สุดและร้อนแรงที่สุด"
            },
            "tickets": {
                "title": "การแสดง / นิทรรศการ",
                "description": "เวทีแห่งความประทับใจและตื่นเต้น เวลาแห่งการพบปะศิลปะ"
            },
            "art": {
                "title": "กิจกรรม / สไตล์",
                "description": "ความกลมกลืนของกิจกรรมและสไตล์"
            },
            "style": {
                "title": "รูปภาพ / วิดีโอ",
                "description": "ทัศนศิลป์และสื่อเชิงสร้างสรรค์"
            },
            "travel": {
                "title": "ท้องถิ่น / ท่องเที่ยว",
                "description": "ค้นหาความงามที่ซ่อนอยู่ในทุกมุมของเกาหลี"
            },
            "community": {
                "title": "ชุมชน",
                "description": "พื้นที่แบ่งปันความชอบและสนุกด้วยกัน"
            }
        },
        "hero": {
            "title": "สัมผัสความงามของเกาหลีด้วยความรู้สึกที่ทันสมัย",
            "subtitle": "พื้นที่วัฒนธรรมที่ผสมผสานความดั้งเดิมและความทันสมัย, department",
            "cta": "ดูแผนผังชั้น",
            "promotion_title": "มุมมองทางวัฒนธรรม จุดเริ่มต้นของการแลกเปลี่ยน",
            "promotion_subtitle": "เราแบ่งปันแก่นแท้ของวัฒนธรรมเกาหลีที่ดั้งเดิมและสมัยใหม่ผสานกันสู่สายตาโลก",
            "promotion_cta": "เจาะลึกการแลกเปลี่ยนวัฒนธรรม"
        },
        "featured": {
            "title": "แนะนำ & กิจกรรม",
            "subtitle": "ประสบการณ์สุดพิเศษที่ Culture Dept.",
            "no_content": "ยังไม่มีเนื้อหาที่ลงทะเบียน",
            "event_ongoing": "อีเวนต์ที่กำลังจัดอยู่",
            "event_upcoming": "อีเวนต์ที่กำลังจะมา",
            "event_archived": "อีเวนต์ที่สิ้นสุดแล้ว",
            "event_ongoing_desc": "อีเวนต์พิเศษที่กำลังดำเนินอยู่",
            "event_upcoming_desc": "อีเวนต์พิเศษที่กำลังจะมา",
            "event_archived_desc": "อีเวนต์นี้สิ้นสุดแล้ว",
            "monthly_recommendations": "แนะนำประจำเดือน",
            "ongoing": "กำลังจัด",
            "upcoming": "เร็วๆ นี้",
            "archived": "สิ้นสุด",
            "image_pending": "รอการอัปโหลดภาพ",
            "no_events": "ไม่มีอีเวนต์",
            "no_events_desc": "วันนี้ไม่มีอีเวนต์ที่กำหนดไว้",
            "back_to_recommendations": "ดูแนะนำทั้งหมด",
            "view_all": "ดูทั้งหมด"
        },
        "about": {
            "title": "มุมมองวัฒนธรรม ศูนย์กลางการแลกเปลี่ยน",
            "subtitle": "สะพานที่เชื่อมต่อประเพณี สมัยใหม่ และคุณ",
            "description1": "department คือฐานที่มั่นของการส่งเสริมวัฒนธรรมและการแลกเปลี่ยนที่ค้นพบแก่นแท้ของวัฒนธรรมเกาหลีและแบ่งปันกับโลก",
            "description2": "เหนือกว่าการส่งเสริมธรรมดา ค้นพบคุณค่าใหม่ของวัฒนธรรมผ่านนิทรรศการและประสบการณ์เชิงลึก และทำให้คุณค่าของการแลกเปลี่ยนเป็นจริง",
            "cta": "ดูวิสัยทัศน์วัฒนธรรม"
        },
        "auth": {
            "login": "เข้าสู่ระบบ",
            "register": "สมัครสมาชิก",
            "email": "อีเมล",
            "password": "รหัสผ่าน",
            "name": "ชื่อ",
            "logout": "ออกจากระบบ",
            "welcome": "ยินดีต้อนรับ",
            "login_title": "เข้าสู่ระบบ",
            "register_title": "สมัครสมาชิก",
            "no_account": "ยังไม่มีบัญชีใช่ไหม?",
            "have_account": "มีบัญชีอยู่แล้วใช่ไหม?",
            "signup": "ลงทะเบียน",
            "submit": "ยืนยัน",
            "loading": "กำลังดำเนินการ...",
            "error_generic": "เกิดข้อผิดพลาด",
            "forgot_password": "ลืมรหัสผ่าน",
            "find_id": "ค้นหาอีเมล",
            "reset_password_sent": "อีเมลรีเซ็ตรหัสผ่านถูกส่งแล้ว",
            "find_email_success": "อีเมลของคุณคือ {{email}}",
            "find_email_not_found": "ไม่พบบัญชีที่ลงทะเบียนด้วยข้อมูลนี้",
            "social_login": "เข้าสู่ระบบด้วยโซเชียล",
            "google_login": "ดำเนินการต่อด้วย Google",
            "signup_success_check_email": "สมัครสมาชิกสำเร็จ! โปรดตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ",
            "rate_limit_exceeded": "ส่งคำขอมากเกินไป โปรดลองอีกครั้งในภายหลัง"
        },
        "footer": {
            "address": "123 โซกงโร, จุงกู, โซล",
            "copyright": "© 2026 Culture Dept. Store. All rights reserved.",
            "privacy": "นโยบายความเป็นส่วนตัว",
            "terms": "ข้อตกลงและเงื่อนไข",
            "shop": "SHOP",
            "support": "สนับสนุน",
            "contact": "ติดต่อ",
            "description": "แพลตฟอร์มวัฒนธรรมระดับพรีเมียมที่นำเสนอความงามของศิลปะและวัฒนธรรมเกาหลีสู่สายตาโลก",
            "notice": "ประกาศ",
            "faq": "คำถามที่พบบ่อย",
            "inquiry": "สอบถามแบบ 1:1",
            "weekdays": "วันธรรมดา 10:00 - 18:00 (หยุดเสาร์-อาทิตย์และวันหยุดนักขัตฤกษ์)"
        },
        "artist": {
            "title": "ศิลปินแห่งปี 10 คน"
        },
        "calendar": {
            "title": "ปฏิทินวัฒนธรรมประจำเดือน",
            "event_desc": "อย่าพลาดกิจกรรมวัฒนธรรมพิเศษในวันที่เลือก",
            "hover_hint": "เลือกวันที่เพื่อดู"
        },
        "shorts": {
            "title": "ไลฟ์ชอร์ต"
        },
        "brand": {
            "title": "แบรนด์สปอตไลท์"
        },
        "common": {
            "view_all": "ดูทั้งหมด",
            "view_details": "ดูรายละเอียด",
            "date": "วันที่",
            "location": "สถานที่",
            "price": "ราคา",
            "loading": "กำลังโหลด...",
            "error": "เกิดข้อผิดพลาด",
            "no_content": "ไม่มีเนื้อหา",
            "back_home": "กลับหน้าแรก",
            "back": "กลับ",
            "booking": "การจอง",
            "share": "แชร์",
            "duration": "ระยะเวลา",
            "duration_value": "ประมาณ 90 นาที",
            "detail_intro": "รายละเอียดแนะนำ",
            "download": "ดาวน์โหลด",
            "register_product": "ลงทะเบียนสินค้า",
            "guest": "ผู้เยี่ยมชม",
            "share_modal": {
                "title": "แชร์",
                "copy_link": "คัดลอกลิงก์",
                "copied": "คัดลอกลิงก์แล้ว",
                "sns": {
                    "kakao": "KakaoTalk",
                    "facebook": "Facebook",
                    "twitter": "Twitter",
                    "more": "เพิ่มเติม"
                }
            },
            "close": "ปิด"
        },
        "search": {
            "placeholder": "กรอกคำค้นหา...",
            "no_results": "ไม่พบผลลัพธ์การค้นหา",
            "results_for": "ผลลัพธ์การค้นหาสำหรับ '{{query}}'",
            "close": "ปิด"
        },
        "admin": {
            "sidebar": {
                "title": "ระบบแอดมิน",
                "products": "จัดการสินค้า",
                "users": "จัดการสมาชิก",
                "bookings": "ประวัติโปรแกรม",
                "logout": "ออกจากระบบ"
            },
            "product": {
                "title": "จัดการสินค้า",
                "add": "เพิ่มสินค้า",
                "edit": "แก้ไขสินค้า",
                "delete_confirm": "คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?",
                "search_placeholder": "ค้นหาจากชื่อสินค้า...",
                "table": {
                    "image": "รูปภาพ",
                    "title": "ชื่อสินค้า",
                    "category": "หมวดหมู่",
                    "price": "ราคา",
                    "actions": "จัดการ"
                },
                "form": {
                    "basic_info": "ข้อมูลพื้นฐาน",
                    "content_details": "รายละเอียด",
                    "image_label": "รูปภาพสินค้า",
                    "video_label": "URL ของวิดีโอ YouTube (ตัวเลือก)",
                    "main_category": "หมวดหมู่หลัก (ชั้น)",
                    "sub_category": "หมวดหมู่ย่อย",
                    "manage_closed": "จัดการวันหยุดพักผ่อน",
                    "closed_description": "คลิกที่วันในปฏิทินเพื่อตั้งเป็นวันหยุด (สีแดง: วันหยุด)",
                    "selected_closed": "วันหยุดที่เลือก",
                    "no_closed": "ไม่มีวันหยุดที่เลือก",
                    "save": "บันทึก",
                    "saving": "กำลังบันทึก...",
                    "upload_image": "อัปโหลดภาพ",
                    "uploading": "กำลังอัปโหลด...",
                    "replace_image": "เปลี่ยนภาพ",
                    "closed_day": "วันหยุด",
                    "open_day": "เปิดบริการ"
                }
            },
            "user": {
                "title": "จัดการสมาชิก",
                "subtitle": "จัดการสมาชิกทั้งหมดและสิทธิ์",
                "search_placeholder": "ค้นหาชื่อหรืออีเมล",
                "table": {
                    "user": "ผู้ใช้",
                    "email": "อีเมล",
                    "role": "สิทธิ์",
                    "actions": "จัดการ"
                },
                "promote": "เลื่อนขั้น",
                "demote": "ลดขั้น",
                "delete": "ลบ",
                "no_users": "ไม่พบสมาชิกที่ค้นหา"
            },
            "booking": {
                "title": "จัดการประวัติโปรแกรม",
                "filter": {
                    "status": "สถานะ",
                    "payment": "ประเภท",
                    "search": "ค้นหา",
                    "from": "วันที่เริ่ม",
                    "to": "วันที่สิ้นสุด",
                    "all_status": "สถานะทั้งหมด",
                    "all_methods": "ประเภททั้งหมด"
                },
                "table": {
                    "date": "วันที่",
                    "user": "ผู้ใช้",
                    "product": "โปรแกรม / หมวดหมู่",
                    "payment": "ประเภท",
                    "amount": "จำนวน",
                    "settlement": "สรุปข้อมูล",
                    "status": "สถานะ",
                    "actions": "จัดการ"
                },
                "settle": "ยืนยัน",
                "settle_confirm": "คุณต้องการยืนยันประวัตินี้หรือไม่?",
                "settle_error": "การจัดการล้มเหลว",
                "settled": "ยืนยันเสร็จสิ้น",
                "pending_settle": "รอดำเนินการ",
                "delete_confirm": "คุณต้องการลบประวัตินี้หรือไม่?"
            }
        }
    }
},
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: 'ko', // Default language
        fallbackLng: 'ko',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
