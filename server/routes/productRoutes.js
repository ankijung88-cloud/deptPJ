import express from 'express';
import { 
  getAllProducts, 
  getProductsByCategory, 
  getProductById, 
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { authenticateAdmin, optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuthenticate, getAllProducts);
router.post('/', authenticateAdmin, createProduct);
router.get('/category/:category', optionalAuthenticate, getProductsByCategory);
router.get('/search', authenticateAdmin, searchProducts);
router.get('/:id', optionalAuthenticate, getProductById);
router.put('/:id', authenticateAdmin, updateProduct);
router.delete('/:id', authenticateAdmin, deleteProduct);

export default router;
