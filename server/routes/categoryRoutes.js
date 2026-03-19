import express from 'express';
import { 
  getFloorCategories, 
  getNavItems,
  createFloorCategory,
  updateFloorCategory,
  deleteFloorCategory,
  createNavItem,
  updateNavItem,
  deleteNavItem
} from '../controllers/categoryController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/floors', getFloorCategories);
router.post('/floors', authenticateAdmin, createFloorCategory);
router.put('/floors/:id', authenticateAdmin, updateFloorCategory);
router.delete('/floors/:id', authenticateAdmin, deleteFloorCategory);

router.get('/nav', getNavItems);
router.post('/nav', authenticateAdmin, createNavItem);
router.put('/nav/:id', authenticateAdmin, updateNavItem);
router.delete('/nav/:id', authenticateAdmin, deleteNavItem);

export default router;
