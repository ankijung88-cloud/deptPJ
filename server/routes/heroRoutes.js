import express from 'express';
import { getHeroImages, addHeroImage, updateHeroImageOrder, deleteHeroImage } from '../controllers/heroController.js';

const router = express.Router();

router.get('/', getHeroImages);
router.post('/', addHeroImage);
router.put('/:id', updateHeroImageOrder);
router.delete('/:id', deleteHeroImage);

export default router;
