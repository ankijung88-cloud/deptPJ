import express from 'express';
import { createReservation, getReservations, updateReservationStatus, deleteReservation } from '../controllers/reservationController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createReservation);
router.get('/', authenticateAdmin, getReservations);
router.patch('/:id/status', authenticateAdmin, updateReservationStatus);
router.delete('/:id', authenticateAdmin, deleteReservation);

export default router;
