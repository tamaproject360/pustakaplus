import { Router } from 'express';
import * as notifications from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, notifications.getNotifications);
router.put('/read-all', authenticate, notifications.markAllAsRead);
router.put('/:id/read', authenticate, notifications.markAsRead);

export default router;
