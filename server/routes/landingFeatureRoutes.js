import express from 'express';
import { getAllFeatures, createFeature, updateFeature, deleteFeature } from '../controllers/landingFeatureController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllFeatures);
router.post('/', authenticateToken, isAdmin, createFeature);
router.put('/:id', authenticateToken, isAdmin, updateFeature);
router.delete('/:id', authenticateToken, isAdmin, deleteFeature);

export default router;
