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

const router = express.Router();

router.get('/floors', getFloorCategories);
router.post('/floors', createFloorCategory);
router.put('/floors/:id', updateFloorCategory);
router.delete('/floors/:id', deleteFloorCategory);

router.get('/nav', getNavItems);
router.post('/nav', createNavItem);
router.put('/nav/:id', updateNavItem);
router.delete('/nav/:id', deleteNavItem);

export default router;
