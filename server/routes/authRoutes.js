import express from 'express';
import { login } from '../controllers/authController.js';
import { getAgencies, createAgency, updateAgency, deleteAgency } from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth routes
router.post('/login', login);

// Admin-only Agency Management
router.get('/agencies', authenticateAdmin, getAgencies);
router.post('/agencies', authenticateAdmin, createAgency);
router.put('/agencies/:id', authenticateAdmin, updateAgency);
router.delete('/agencies/:id', authenticateAdmin, deleteAgency);

export default router;
