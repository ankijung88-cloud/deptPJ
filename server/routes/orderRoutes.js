import express from 'express';
import { createOrder, getAllOrders, updateOrderStatus, deleteOrder } from '../controllers/orderController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

// Public route for customers to place orders
router.post('/', createOrder);

// Protected routes for admins and agencies to manage orders
router.get('/', authenticateAdmin, getAllOrders);
router.patch('/:id/status', authenticateAdmin, updateOrderStatus);
router.delete('/:id', authenticateAdmin, deleteOrder);


export default router;
