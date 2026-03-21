import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import './config/init_db.js'; // Database auto-heal

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve static files
const videoPath = path.join(__dirname, '../public/videos');
const fallbackVideoPath = path.join(__dirname, '../public/video');

app.use('/assets/videos', express.static(videoPath));
app.use('/assets/videos', express.static(fallbackVideoPath));
app.use('/assets/video', express.static(videoPath));
app.use('/assets/video', express.static(fallbackVideoPath));

// Serve uploads (SSD first, then DB fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', uploadRoutes);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const errorInfo = `[${new Date().toISOString()}] ${err.stack || err}\n`;
  try {
    fs.appendFileSync(path.join(__dirname, 'error_log.txt'), errorInfo);
  } catch (logErr) {
    console.error('Failed to write to error log:', logErr);
  }
  console.error('[Global Error Handler]:', err);
  res.status(500).json({ 
    message: err.message || 'Internal Server Error'
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dept Backend is running - V2' });
});

// DEBUG: Check DB content
import pool from './config/db.js';
app.get('/api/debug/subcategories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT subcategory FROM featured_items');
    const [all] = await pool.query('SELECT id, title, category, subcategory, agency_id FROM featured_items LIMIT 50');
    res.json({ 
      unique_subcategories: rows.map(r => r.subcategory),
      sample_items: all 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Emergency Migration Trigger
app.get('/api/admin/migrate-now', async (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  const results = { total: 0, success: 0, errors: [] };
  
  try {
    if (!fs.existsSync(uploadDir)) {
      return res.status(404).json({ error: 'Upload directory not found', path: uploadDir });
    }

    const files = fs.readdirSync(uploadDir).filter(f => f !== '.gitkeep');
    results.total = files.length;

    for (const filename of files) {
      try {
        const filePath = path.join(uploadDir, filename);
        const data = fs.readFileSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        const mimetype = ext === '.png' ? 'image/png' : (ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : (ext === '.webm' ? 'video/webm' : 'application/octet-stream'));

        await pool.query(
          'INSERT INTO media_storage (filename, mimetype, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE mimetype=VALUES(mimetype), data=VALUES(data)',
          [filename, mimetype, data]
        );
        results.success++;
      } catch (err) {
        results.errors.push({ file: filename, error: err.message });
      }
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
