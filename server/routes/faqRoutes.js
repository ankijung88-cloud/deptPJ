import express from 'express';
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faqController.js';

const router = express.Router();

router.get('/', getAllFaqs);
router.post('/', createFaq);
router.put('/:id', updateFaq);
router.delete('/:id', deleteFaq);

export default router;
