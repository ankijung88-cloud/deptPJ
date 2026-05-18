import pool from './db.js';

/**
 * Self-healing Database Migration
 * Checks if side_image_url and back_image_url columns exist in featured_items table.
 * If not, adds them.
 */
async function initDB() {
  try {
    console.log('[DB] Checking schema...');
    
    // Check if side_image_url exists
    const [sideColumns] = await pool.query("SHOW COLUMNS FROM featured_items LIKE 'side_image_url'");
    
    if (sideColumns.length === 0) {
      console.log('[DB] Missing multi-angle columns detected. Running migration...');
      
      // Add columns if they don't exist
      await pool.query(`
        ALTER TABLE featured_items 
        ADD COLUMN side_image_url TEXT AFTER thumbnail_url,
        ADD COLUMN back_image_url TEXT AFTER side_image_url
      `);
      
      console.log('[DB] Migration successful: Added side_image_url and back_image_url.');
    }

    // Check if selected_templates exists
    const [templateColumns] = await pool.query("SHOW COLUMNS FROM featured_items LIKE 'selected_templates'");
    if (templateColumns.length === 0) {
      console.log('[DB] Missing selected_templates column detected. Running migration...');
      await pool.query("ALTER TABLE featured_items ADD COLUMN selected_templates JSON DEFAULT NULL");
      console.log('[DB] Migration successful: Added selected_templates.');
    } else {
      console.log('[DB] featured_items schema is up to date.');
    }

    // NEW: Create media_storage table if it doesn't exist
    console.log('[DB] Ensuring media_storage table exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_storage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        data LONGBLOB NULL, -- Changed from NOT NULL to support SSD-only files
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('[DB] media_storage table is ready.');

    // NEW: Create users table if it doesn't exist
    console.log('[DB] Ensuring users table exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'AGENCY') NOT NULL DEFAULT 'AGENCY',
        agency_name VARCHAR(255) NULL,
        birth_date VARCHAR(10) NULL,
        phone_mobile VARCHAR(20) NULL,
        phone_company VARCHAR(20) NULL,
        address TEXT NULL,
        address_detail TEXT NULL,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    
    // Migration: Check if status column exists for existing table
    const [statusColumns] = await pool.query("SHOW COLUMNS FROM users LIKE 'status'");
    if (statusColumns.length === 0) {
      console.log('[DB] Missing status column in users. Running migration...');
      await pool.query("ALTER TABLE users ADD COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING' AFTER agency_name");
      await pool.query("UPDATE users SET status = 'APPROVED' WHERE role = 'ADMIN'");
      console.log('[DB] Migration successful: Added status to users.');
    }

    // New Migration: Add birth_date, phone_mobile, phone_company, address, address_detail
    const [birthColumns] = await pool.query("SHOW COLUMNS FROM users LIKE 'birth_date'");
    if (birthColumns.length === 0) {
      console.log('[DB] Missing extended info columns in users. Running migration...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN birth_date VARCHAR(10) NULL AFTER agency_name,
        ADD COLUMN phone_mobile VARCHAR(20) NULL AFTER birth_date,
        ADD COLUMN phone_company VARCHAR(20) NULL AFTER phone_mobile,
        ADD COLUMN address TEXT NULL AFTER phone_company,
        ADD COLUMN address_detail TEXT NULL AFTER address
      `);
      console.log('[DB] Migration successful: Added extended info columns to users.');
    }
    console.log('[DB] users table is ready.');

    // Seed default admin if no users exist
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('[DB] Seeding default admin user...');
      const ADMIN_USER = process.env.ADMIN_USER || 'admin';
      const ADMIN_PASS = process.env.ADMIN_PASS || 'admin1234';
      await pool.query(
        'INSERT INTO users (username, password, role, agency_name) VALUES (?, ?, ?, ?)',
        [ADMIN_USER, ADMIN_PASS, 'ADMIN', 'System Admin']
      );
    }

    // Check if agency_id exists in featured_items
    const [agencyColumns] = await pool.query("SHOW COLUMNS FROM featured_items LIKE 'agency_id'");
    if (agencyColumns.length === 0) {
      console.log('[DB] Missing agency_id column in featured_items. Running migration...');
      await pool.query("ALTER TABLE featured_items ADD COLUMN agency_id INT NULL AFTER id");
      
      // Assign existing products to the first admin
      const [adminRows] = await pool.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
      if (adminRows.length > 0) {
        await pool.query("UPDATE featured_items SET agency_id = ? WHERE agency_id IS NULL", [adminRows[0].id]);
      }
      console.log('[DB] Migration successful: Added agency_id to featured_items.');
    }
    
    // NEW: Add missing columns to featured_items with fault-tolerant individual checks
    const addColumnSafely = async (columnName, addSql) => {
      try {
        const [cols] = await pool.query(`SHOW COLUMNS FROM featured_items LIKE ?`, [columnName]);
        if (cols.length === 0) {
          console.log(`[DB] Missing ${columnName} in featured_items. Running migration...`);
          await pool.query(addSql);
          console.log(`[DB] Migration successful: Added ${columnName}.`);
        }
      } catch (err) {
        console.error(`[DB] Migration failed for ${columnName} (non-critical):`, err.message);
      }
    };

    await addColumnSafely('long_description', "ALTER TABLE featured_items ADD COLUMN long_description TEXT");
    await addColumnSafely('detail_media_url', "ALTER TABLE featured_items ADD COLUMN detail_media_url TEXT");
    await addColumnSafely('detail_media_type', "ALTER TABLE featured_items ADD COLUMN detail_media_type VARCHAR(20) DEFAULT 'image'");
    await addColumnSafely('page_type', "ALTER TABLE featured_items ADD COLUMN page_type VARCHAR(50) NULL");
    await addColumnSafely('parent_id', "ALTER TABLE featured_items ADD COLUMN parent_id VARCHAR(255) NULL");
    await addColumnSafely('theme_data', "ALTER TABLE featured_items ADD COLUMN theme_data JSON NULL");
    await addColumnSafely('reservation_programs', "ALTER TABLE featured_items ADD COLUMN reservation_programs JSON NULL");
    await addColumnSafely('reservation_slots', "ALTER TABLE featured_items ADD COLUMN reservation_slots JSON NULL");
    await addColumnSafely('metadata', "ALTER TABLE featured_items ADD COLUMN metadata JSON NULL");

    // NEW: Ensure 'description' column is TEXT to prevent "Data too long" errors
    try {
      const [descCols] = await pool.query("SHOW COLUMNS FROM featured_items LIKE 'description'");
      if (descCols.length > 0 && !descCols[0].Type.toLowerCase().includes('text')) {
        console.log('[DB] Description column type is too small. Upgrading to TEXT...');
        await pool.query("ALTER TABLE featured_items MODIFY COLUMN description TEXT");
        console.log('[DB] Migration successful: description column updated to TEXT.');
      }
    } catch (err) {
      console.warn('[DB] Non-critical migration failed for description:', err.message);
    }

    // NEW: Ensure parent_id is VARCHAR(255) to support string IDs from templates
    try {
      const [parentCols] = await pool.query("SHOW COLUMNS FROM featured_items LIKE 'parent_id'");
      if (parentCols.length > 0 && parentCols[0].Type.toLowerCase().includes('int')) {
        console.log('[DB] parent_id column is INT. Upgrading to VARCHAR(255)...');
        await pool.query("ALTER TABLE featured_items MODIFY COLUMN parent_id VARCHAR(255) NULL");
        console.log('[DB] Migration successful: parent_id column updated to VARCHAR(255).');
      }
    } catch (err) {
      console.warn('[DB] Non-critical migration failed for parent_id type:', err.message);
    }

    // Check if agency_id exists in notices

    // Ensure data column allows NULL
    const [mediaColumns] = await pool.query("SHOW COLUMNS FROM media_storage LIKE 'data'");
    if (mediaColumns.length > 0 && mediaColumns[0].Null === 'NO') {
      console.log('[DB] Updating media_storage.data to allow NULL...');
      await pool.query("ALTER TABLE media_storage MODIFY COLUMN data LONGBLOB NULL");
    }

    // NEW: Create orders table if it doesn't exist
    console.log('[DB] Ensuring orders table exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(50) UNIQUE NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        user_phone VARCHAR(20) NOT NULL,
        user_address TEXT NOT NULL,
        product_id VARCHAR(100) NOT NULL,
        product_name TEXT NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        status ENUM('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
        payment_id VARCHAR(100) NULL,
        agency_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (order_id),
        INDEX (agency_id)
      ) ENGINE=InnoDB;
    `);
    console.log('[DB] orders table is ready.');
    
    // NEW: Create hero_images table if it doesn't exist
    console.log('[DB] Ensuring hero_images table exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url TEXT NOT NULL,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('[DB] hero_images table is ready.');

    // NEW: Create landing_features table if it doesn't exist
    console.log('[DB] Ensuring landing_features table exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS landing_features (
        id INT AUTO_INCREMENT PRIMARY KEY,
        feature_id VARCHAR(50) NULL,
        number VARCHAR(10) NULL,
        subtitle JSON NULL,
        title VARCHAR(255) NULL,
        kor_title JSON NULL,
        description JSON NULL,
        detail_info JSON NULL,
        benefits JSON NULL,
        media_url TEXT NULL,
        media_type ENUM('image', 'video') DEFAULT 'image',
        gradient VARCHAR(100) NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('[DB] landing_features table is ready.');

    // NEW: Create floor_categories table if it doesn't exist
    console.log('[DB] Ensuring floor_categories table exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS floor_categories (
        id VARCHAR(50) PRIMARY KEY,
        floor VARCHAR(10) NOT NULL,
        title JSON NOT NULL,
        description JSON NOT NULL,
        bg_image TEXT NULL,
        content JSON NULL,
        subitems JSON NULL,
        color VARCHAR(20) NULL,
        video_url TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('[DB] floor_categories table is ready.');

    // Seed default floor categories if empty
    const [floorRows] = await pool.query('SELECT COUNT(*) as count FROM floor_categories');
    if (floorRows[0].count === 0) {
      console.log('[DB] Seeding default floor categories...');
      const defaultFloors = [
        ['floor-6', '6F', JSON.stringify({ko: '그로스 마켓', en: 'Growth Market'}), JSON.stringify({ko: '공동구매와 프리오더', en: 'Group Buy & Pre-order'}), '#E74C3C'],
        ['floor-5', '5F', JSON.stringify({ko: '노마드 워크플레이', en: 'Nomad Workplay'}), JSON.stringify({ko: '일하고 즐기는 공간', en: 'Work & Play Space'}), '#00D2FF'],
        ['floor-4', '4F', JSON.stringify({ko: '로컬 헤리티지', en: 'Local Heritage'}), JSON.stringify({ko: '지역 문화 유산', en: 'Local Culture & Heritage'}), '#00A8FF'],
        ['floor-3', '3F', JSON.stringify({ko: '아트 디스커버리', en: 'Art Discovery'}), JSON.stringify({ko: '아름다운 가치 발견', en: 'Discover Beautiful Values'}), '#2ECC71'],
        ['floor-2', '2F', JSON.stringify({ko: '뷰티 앤 패션', en: 'Beauty & Fashion'}), JSON.stringify({ko: '건강함과 정체성', en: 'Health & Identity'}), '#F39C12'],
        ['floor-1', '1F', JSON.stringify({ko: '테크 앤 케어', en: 'Tech & Care'}), JSON.stringify({ko: '스마트 기술과 웰니스', en: 'Smart Tech & Wellness'}), '#FFD32A']
      ];
      for (const f of defaultFloors) {
        await pool.query('INSERT INTO floor_categories (id, floor, title, description, color) VALUES (?, ?, ?, ?, ?)', f);
      }
    }

    // NEW: Seed landing features if empty
    const [featureRows] = await pool.query('SELECT COUNT(*) as count FROM landing_features');
    if (featureRows[0].count === 0) {
      console.log('[DB] Seeding default landing features...');
      const defaultFeatures = [
        [
          'office', '01', 
          JSON.stringify({ko: 'The Future of Workplace', en: 'The Future of Workplace'}),
          'Spatial Productivity',
          JSON.stringify({ko: '압도적 생산성의 공간', en: 'Spatial Productivity'}),
          JSON.stringify({ko: '단순한 화상 회의를 넘어선 초몰입형 워크스페이스. 물리적 사무실의 가치를 디지털로 완벽하게 치환합니다.', en: 'Beyond simple video conferencing...'}),
          JSON.stringify({ko: '집이나 카페 어디서든 사무실과 동일한 현장감을 제공합니다.', en: 'Provides the same sense of presence as an office...'}),
          JSON.stringify(['집중을 위한 프라이빗 부스 시스템', '실시간 협업 도구 내장', '2D 가상 오피스']),
          'from-dancheong-mugwort/20 to-transparent', 0
        ],
        [
          'commerce', '02', 
          JSON.stringify({ko: 'Immersive Shopping Experience', en: 'Immersive Shopping Experience'}),
          'Immersive Sales',
          JSON.stringify({ko: '브랜드 가치를 높이는 경험형 커머스', en: 'Immersive Sales'}),
          JSON.stringify({ko: '평면적인 쇼핑을 입체적인 브랜드 경험으로. 고객이 머물고 싶어 하는 인터랙티브 팝업 스토어를 구축하세요.', en: 'Turn flat shopping into 3D experiences...'}),
          JSON.stringify({ko: '브랜드의 철학과 감성을 담은 2D 공간에서 고객과 만나보세요.', en: 'Meet customers in a 2D space...'}),
          JSON.stringify(['실시간 소통이 가능한 라이브 쇼룸', '고객 행동 데이터 기반 최적화', '커스텀 테마 지원']),
          'from-dancheong-navy/20 to-transparent', 1
        ],
        [
          'conference', '03', 
          JSON.stringify({ko: 'Limitless Collaboration', en: 'Limitless Collaboration'}),
          'Infinite Scalability',
          JSON.stringify({ko: '언어와 국경을 넘는 무한한 확장성', en: 'Infinite Scalability'}),
          JSON.stringify({ko: '다국어 실시간 번역으로 전 세계와 연결됩니다. 대규모 컨퍼런스부터 기업 온보딩까지 경계 없이 개최하세요.', en: 'Connect globally with real-time translation...'}),
          JSON.stringify({ko: '언어는 더 이상 비즈니스의 장벽이 아닙니다.', en: 'Language is no longer a barrier...'}),
          JSON.stringify(['AI 기반 다국어 실시간 자막 및 번역', '초대형 행사용 프로젝션 시스템', '전 세계 끊김 없는 연결성']),
          'from-dancheong-ink/20 to-transparent', 2
        ]
      ];
      for (const f of defaultFeatures) {
        await pool.query(`
          INSERT INTO landing_features 
          (feature_id, number, subtitle, title, kor_title, description, detail_info, benefits, gradient, display_order) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, f);
      }
    }

    // Seed hero images if empty
    const [heroRows] = await pool.query('SELECT COUNT(*) as count FROM hero_images');
    if (heroRows[0].count === 0) {
      console.log('[DB] Seeding default hero images...');
      const defaultHeros = [
        ['https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=2560&auto=format&fit=crop', 0],
        ['https://images.unsplash.com/photo-1517260739337-6799d239ce83?q=80&w=2560&auto=format&fit=crop', 1]
      ];
      for (const h of defaultHeros) {
        await pool.query('INSERT INTO hero_images (image_url, display_order) VALUES (?, ?)', h);
      }
    }

  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN') {
      console.log('[DB] Columns already exist.');
    } else {
      console.error('[DB] Schema check failed:', error.message);
    }
  }
}

// Export the initialization function to be called from a safe context (e.g. server.js app.listen)
export default initDB;

