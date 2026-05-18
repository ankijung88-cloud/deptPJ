import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

async function run() {
  try {
    const product = {
      id: 'item-20260331-w2hs2',
      title: JSON.stringify({ko: '모든차 서비스', en: ''}),
      description: JSON.stringify({ko: '신차구입부터 경정비, 세차, 광택, 중고차, 수출, 폐차, 부품판매 및 수출까지 가능합니다.', en: ''}),
      category: 'floor-1',
      subcategory: 'standard',
      page_type: 'standard',
      image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
      detail_media_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
      detail_media_type: 'image',
      price: '',
      location: JSON.stringify({ko: '서울시 강남구', en: ''}),
      event_date: JSON.stringify({ko: '2026-03-31', en: ''}),
      closed_days: JSON.stringify({ko: '주말', en: ''}),
      video_url: '',
      parent_id: null,
      theme_data: null,
      selected_templates: null,
      agency_id: null,
      metadata: null
    };

    const query = 'INSERT INTO featured_items (id, title, description, category, subcategory, page_type, image_url, thumbnail_url, detail_media_url, detail_media_type, price, `location`, event_date, closed_days, video_url, parent_id, theme_data, selected_templates, agency_id, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [
      product.id, product.title, product.description, product.category, product.subcategory, product.page_type, 
      product.image_url, product.thumbnail_url, product.detail_media_url, product.detail_media_type, 
      product.price, product.location, product.event_date, product.closed_days, product.video_url, 
      product.parent_id, product.theme_data, product.selected_templates, product.agency_id, product.metadata
    ];
    
    await pool.query(query, params);
    console.log('Restored 모든차 서비스');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
