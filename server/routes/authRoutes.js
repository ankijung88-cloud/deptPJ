import express from 'express';
import { login } from '../controllers/authController.js';
import * as authController from '../controllers/authController.js';
import * as adminController from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected agency management routes (Admin only)
router.get('/agencies', authenticateAdmin, adminController.getAgencies);
router.post('/agencies', authenticateAdmin, adminController.createAgency);
router.put('/agencies/:id', authenticateAdmin, adminController.updateAgency);
router.delete('/agencies/:id', authenticateAdmin, adminController.deleteAgency);
router.put('/agencies/:id/status', authenticateAdmin, adminController.updateAgencyStatus);

export default router;
