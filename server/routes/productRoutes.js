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
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateAdmin, getAllProducts);
router.post('/', authenticateAdmin, createProduct);
router.get('/category/:category', getProductsByCategory);
router.get('/search', authenticateAdmin, searchProducts);
router.get('/:id', getProductById);
router.put('/:id', authenticateAdmin, updateProduct);
router.delete('/:id', authenticateAdmin, deleteProduct);

export default router;
