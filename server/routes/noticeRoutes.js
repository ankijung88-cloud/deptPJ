import express from 'express';
import { getAllNotices, createNotice, updateNotice, deleteNotice } from '../controllers/noticeController.js';

const router = express.Router();

router.get('/', getAllNotices);
router.post('/', createNotice);
router.put('/:id', updateNotice);
router.delete('/:id', deleteNotice);

export default router;
