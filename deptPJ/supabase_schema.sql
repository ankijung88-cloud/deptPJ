-- Supabase (PostgreSQL) Schema for DEPT-Pj2-main mockData 

-- 1. NAV_ITEMS (네비게이션 카테고리)
CREATE TABLE IF NOT EXISTS nav_items (
    id VARCHAR(50) PRIMARY KEY,
    href VARCHAR(255) NOT NULL,
    subitems JSONB -- 하위 메뉴 항목 (JSON 형태)
);

-- 2. FLOOR_CATEGORIES (층별 카테고리 정보)
CREATE TABLE IF NOT EXISTS floor_categories (
    id VARCHAR(50) PRIMARY KEY,
    floor VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,         -- 다국어 API 연동을 위한 한국어 원문 
    description TEXT NOT NULL,   -- 다국어 API 연동을 위한 한국어 원문
    bg_image TEXT,
    content JSONB,               -- 내부 텍스트도 원문만 저장하도록 변경 필요
    subitems JSONB               -- 내부 라벨도 원문만 저장하도록 변경 필요
);

-- 3. FEATURED_ITEMS (추천 및 이벤트 아이템)
CREATE TABLE IF NOT EXISTS featured_items (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,         -- 한국어 원문
    category VARCHAR(50),
    subcategory VARCHAR(50),
    description TEXT,            -- 한국어 원문
    image_url TEXT,
    event_date TEXT,             -- 한국어 원문
    location TEXT,               -- 한국어 원문
    price TEXT                   -- 한국어 원문
);

-- 4. ARTISTS_OF_THE_YEAR (올해의 아티스트)
CREATE TABLE IF NOT EXISTS artists (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,          -- 한국어 원문
    artist_type TEXT,            -- 한국어 원문 (type 명칭 충돌 방지)
    description TEXT,            -- 한국어 원문
    image_url TEXT,
    subcategory VARCHAR(50)
);

-- 5. CALENDAR_EVENTS (캘린더 이벤트)
CREATE TABLE IF NOT EXISTS calendar_events (
    id VARCHAR(50) PRIMARY KEY,
    event_date DATE NOT NULL,
    title TEXT NOT NULL,         -- 한국어 원문
    category VARCHAR(50),
    image_url TEXT
);

-- 6. BRAND_SPOTLIGHTS (브랜드 스포트라이트)
CREATE TABLE IF NOT EXISTS brand_spotlights (
    id VARCHAR(50) PRIMARY KEY,
    brand_name TEXT NOT NULL,    -- 한국어 원문
    title TEXT NOT NULL,         -- 한국어 원문
    description TEXT,            -- 한국어 원문
    image_url TEXT,
    tags JSONB                   -- 한국어 태그 배열을 위한 JSONB (예: ["미니멀", "전통"])
);

-- 7. LIVE_SHORTS (라이브 쇼츠 영상 콘텐츠)
CREATE TABLE IF NOT EXISTS live_shorts (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,         -- 한국어 원문
    video_url TEXT,
    location TEXT,               -- 한국어 원문
    view_count INTEGER DEFAULT 0
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- 사용자 화면(프론트엔드)에서 데이터를 누구나 읽을 수(SELECT) 있게 허용합니다.
-- ==========================================

-- RLS 활성화
ALTER TABLE nav_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_spotlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_shorts ENABLE ROW LEVEL SECURITY;

-- public(모든 사용자)에게 SELECT 권한 부여
CREATE POLICY "Allow public read access to nav_items" ON nav_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access to floor_categories" ON floor_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to featured_items" ON featured_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access to artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Allow public read access to calendar_events" ON calendar_events FOR SELECT USING (true);
CREATE POLICY "Allow public read access to brand_spotlights" ON brand_spotlights FOR SELECT USING (true);
CREATE POLICY "Allow public read access to live_shorts" ON live_shorts FOR SELECT USING (true);
