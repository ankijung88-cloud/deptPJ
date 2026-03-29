import express from 'express';
import { createOrder, getAllOrders, updateOrderStatus, deleteOrder } from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for customers to place orders
router.post('/', createOrder);

// Protected routes for admins and agencies to manage orders
router.get('/', authMiddleware, getAllOrders);
router.patch('/:id/status', authMiddleware, updateOrderStatus);
router.delete('/:id', authMiddleware, deleteOrder);

export default router;
