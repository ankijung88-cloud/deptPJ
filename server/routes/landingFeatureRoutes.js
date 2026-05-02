import express from 'express';
import { getAllFeatures, createFeature, updateFeature, deleteFeature } from '../controllers/landingFeatureController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllFeatures);
router.post('/', authenticateAdmin, createFeature);
router.put('/:id', authenticateAdmin, updateFeature);
router.delete('/:id', authenticateAdmin, deleteFeature);

export default router;
