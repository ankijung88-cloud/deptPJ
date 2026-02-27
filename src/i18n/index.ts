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

                "global": "글로벌 K-컬처",
                "heritage": "전통의 현대화",
                "exchange": "문화 교류 부스",
                "collab": "협업 프로젝트",
                "traditional": "전통 예술",
                "media": "현대 미디어 아트",
                "class": "문화 체험 클래스",
                "kstyle": "글로벌 K-스타일",
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
                "no_content": "등록된 콘텐츠가 없습니다."
            },
            "about": {
                "title": "취향이 살아 숨쉬는 공간, department",
                "subtitle": "전통의 깊이와 현대의 감각이 교차하는 아트 갤러리 백화점",
                "description1": "department은 단순한 소비 공간을 넘어, 일상에 영감을 불어넣는 프리미엄 문화 큐레이션 플랫폼입니다.",
                "description2": "가장 트렌디한 글로벌 K-컬처부터 세월의 깊이를 품은 헤리티지까지, 당신의 시선을 머물게 할 수준 높은 전시와 예술적 경험을 선사합니다.",
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
                "gallery": "Department",
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
                "global": "Global K-Culture",
                "heritage": "Modern Heritage",
                "exchange": "Cultural Exchange Booth",
                "traditional": "Traditional Arts",
                "media": "Modern Media Art",
                "class": "Culture Class",
                "kstyle": "Global K-Style",
                "local_heritage": "Local Cultural Heritage",
                "travel_curation": "Travel Curation",
                "mypage": "My Page",
                "login": "Login"
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
                "no_content": "No content registered yet."
            },
            "about": {
                "title": "A Living Exhibition, department",
                "subtitle": "An Art Gallery Mall where profound heritage meets modern aesthetic.",
                "description1": "Beyond a traditional retail space, department is a premium cultural curation platform designed to inspire your everyday life.",
                "description2": "From the trendiest global K-Culture to timeless heritage, we curate sophisticated exhibitions and artistic experiences that captivate your senses.",
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
                "gallery": "Department",
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
                "global": "グローバル K-カルチャー",
                "heritage": "伝統の現代化",
                "exchange": "文化交流ブース",
                "traditional": "伝統芸術",
                "kstyle": "グローバル K-スタイル",
                "local_heritage": "地域文化遺産",
                "travel_curation": "旅行キュレーション",

                "notice": "お知らせ",
                "qna": "Q&A",
                "reviews": "レビュー",
                "mypage": "マイページ",
                "login": "ログイン"
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
                "no_content": "登録されたコンテンツがありません。"
            },
            "about": {
                "title": "好みが息づく空間、department",
                "subtitle": "伝統の深みと現代の感覚が交差するアートギャラリーデパート",
                "description1": "departmentは単なる消費空間を超え、日常にインスピレーションを吹き込むプレミアム文化キュレーションプラットフォームです。",
                "description2": "最もトレンディなグローバルK-カルチャーから歳月の深みを抱くヘリテージまで、あなたの視線を引きつける質の高い展示と芸術的体験を提供します。",
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
                "gallery": "Department",
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
                "global": "全球K-Culture",
                "heritage": "传统现代化",
                "exchange": "文化交流展位",
                "traditional": "传统艺术",
                "kstyle": "全球K-Style",
                "local_heritage": "地区文化遗产",
                "travel_curation": "旅行策划",

                "notice": "公告",
                "qna": "问答",
                "reviews": "评论",
                "mypage": "个人中心",
                "login": "登录"
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
                "no_content": "暂无已注册的内容。"
            },
            "about": {
                "title": "品味焕发生机的空间，department",
                "subtitle": "传统底蕴与现代感官交汇的艺术画廊百货",
                "description1": "department 超越了单纯的消费空间，是为日常生活注入灵感的高端文化内容策展平台。",
                "description2": "从最前沿的全球K-Culture到承载岁月厚重的文化遗产，我们为您提供引人入胜的高水准展览与艺术体验。",
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
                "register_product": "注册商品"
            },
            "search": {
                "placeholder": "请输入搜索词...",
                "no_results": "没有找到搜索结果。",
                "results_for": "'{{query}}'的搜索结果",
                "close": "关闭"
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
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
