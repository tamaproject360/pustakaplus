import { Router } from 'express';
import * as settings from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('super_admin'), settings.getSettings);
router.put('/:key', authenticate, authorize('super_admin'), settings.updateSetting);

export default router;
