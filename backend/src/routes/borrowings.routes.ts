import { Router } from 'express';
import * as borrowings from '../controllers/borrowings.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, borrowings.getBorrowings);
router.post('/', authenticate, borrowings.createBorrowing);
router.put('/:id/return', authenticate, authorize('pustakawan', 'super_admin'), borrowings.returnBorrowing);

export default router;
