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
import orderRoutes from './routes/orderRoutes.js';
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

// Serve static files (Public Assets)
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// Serve uploads (SSD first, then DB fallback)
const uploadsPath = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));
app.use('/uploads', uploadRoutes);

// Fallback for direct video paths (backward compatibility)
app.use('/videos', express.static(path.join(__dirname, '../public/assets/videos')));
app.use('/video', express.static(path.join(__dirname, '../public/assets/videos')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);

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
// Triggering restart...
 
    message: err.message || 'Internal Server Error'
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dept Backend is running - V2' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
