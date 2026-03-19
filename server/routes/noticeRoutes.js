import express from 'express';
import { getAllNotices, createNotice, updateNotice, deleteNotice } from '../controllers/noticeController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

router.get('/', getAllNotices);
router.post('/', authenticateAdmin, createNotice);
router.put('/:id', authenticateAdmin, updateNotice);
router.delete('/:id', authenticateAdmin, deleteNotice);

export default router;
