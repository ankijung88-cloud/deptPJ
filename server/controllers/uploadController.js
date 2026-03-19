import multer from 'multer';
import path from 'path';
import pool from '../config/db.js';

// Multer in-memory storage for DB-based uploads
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit (adjusted from 1GB for memory safety)
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|mp4|webm|ogg|mov/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Images and Videos only (jpg, png, webp, mp4, webm, mov)'));
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
 * Handle File Upload (Save to DB)
 */
export const handleUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const originalName = req.file.originalname;
    const extension = path.extname(originalName);
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
    const mimetype = req.file.mimetype;
    const buffer = req.file.buffer;

    // Save to media_storage table
    await pool.query(
      'INSERT INTO media_storage (filename, mimetype, data) VALUES (?, ?, ?)',
      [uniqueFilename, mimetype, buffer]
    );

    const fileUrl = `/uploads/${uniqueFilename}`;
    console.log('[Upload] Saved to DB:', fileUrl);
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('[handleUpload] Error:', error);
    res.status(500).json({ message: 'Internal server error during database file processing' });
  }
};

/**
 * Serve File from DB by filename
 */
export const serveFileFromDB = async (req, res) => {
  const { filename } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT mimetype, data FROM media_storage WHERE filename = ?',
      [filename]
    );

    if (rows.length === 0) {
      return res.status(404).send('File not found');
    }

    const { mimetype, data } = rows[0];
    
    // Set headers
    res.set('Content-Type', mimetype);
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    // Send binary data
    res.send(data);
  } catch (error) {
    console.error('[serveFileFromDB] Error:', error);
    res.status(500).send('Internal server error');
  }
};

