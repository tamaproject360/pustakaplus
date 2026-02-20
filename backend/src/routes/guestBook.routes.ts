import { Router } from 'express';
import * as guestBook from '../controllers/guestBook.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, authorize('pustakawan', 'super_admin'), guestBook.getGuestBookStats);
router.get('/', authenticate, guestBook.getGuestBook);
router.post('/check-in', authenticate, guestBook.checkIn);
router.put('/:id/check-out', authenticate, guestBook.checkOut);

export default router;
