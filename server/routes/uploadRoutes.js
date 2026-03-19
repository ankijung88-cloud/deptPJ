import express from 'express';
import { uploadSingle, handleUpload, serveFileFromDB } from '../controllers/uploadController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Serve files from DB
router.get('/:filename', serveFileFromDB);

// Protected: Upload new file
router.post('/', authenticateAdmin, uploadSingle, handleUpload);

export default router;
