import express from 'express';
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faqController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

router.get('/', getAllFaqs);
router.post('/', authenticateAdmin, createFaq);
router.put('/:id', authenticateAdmin, updateFaq);
router.delete('/:id', authenticateAdmin, deleteFaq);

export default router;
