import { Router } from 'express';
import * as reservations from '../controllers/reservations.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, reservations.getReservations);
router.post('/', authenticate, reservations.createReservation);
router.delete('/:id', authenticate, reservations.cancelReservation);
router.put('/:id/notify', authenticate, authorize('pustakawan', 'super_admin'), reservations.notifyReservation);

export default router;
