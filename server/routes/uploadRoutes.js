import express from 'express';
import { uploadSingle, handleUpload } from '../controllers/uploadController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateAdmin, uploadSingle, handleUpload);

export default router;
