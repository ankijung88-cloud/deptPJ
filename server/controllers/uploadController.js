import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../config/db.js';

// Multer disk storage for SSD-based uploads
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage: diskStorage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit (SSD-based streaming)
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|mp4|webm|ogg|mov/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Images and Videos only (jpg, png, webp, mp4, webm, mov) up to 1GB'));
  }
});

export const uploadSingle = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('[Multer Error]:', err);
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
      console.error('[Upload Error]:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

/**
 * Handle File Upload (Save metadata to DB, file is already on SSD)
 */
export const handleUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const uniqueFilename = req.file.filename;
    const mimetype = req.file.mimetype;

    // Save metadata to media_storage table (data column is NULL for new SSD files)
    await pool.query(
      'INSERT INTO media_storage (filename, mimetype, data) VALUES (?, ?, ?)',
      [uniqueFilename, mimetype, null] // No buffer stored in DB
    );

    const fileUrl = `/uploads/${uniqueFilename}`;
    console.log('[Upload] Saved to SSD & Metadata to DB:', fileUrl);
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('[handleUpload] Error:', error);
    res.status(500).json({ message: 'Internal server error during SSD file processing' });
  }
};

/**
 * Serve File (Legacy DB support + Path check)
 * NOTE: This is maintained for backward compatibility. 
 * Future requests will be handled by express.static in server.js.
 */
export const serveFileFromDB = async (req, res) => {
  const { filename } = req.params;
  console.log(`[serveFileFromDB] Request for: ${filename}`);
  try {
    // Check disk first
    const filePath = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    // Fallback to DB (for non-migrated items)
    const [rows] = await pool.query(
      'SELECT mimetype, data FROM media_storage WHERE filename = ?',
      [filename]
    );

    if (rows.length === 0 || !rows[0].data) {
      return res.status(404).send('File not found');
    }

    const { mimetype, data } = rows[0];
    res.set('Content-Type', mimetype);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(data);
  } catch (error) {
    console.error('[serveFileFromDB] Error:', error);
    res.status(500).send('Internal server error');
  }
};
