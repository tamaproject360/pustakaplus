import { Router } from 'express';
import * as users from '../controllers/users.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('super_admin'), users.getUsers);
router.post('/', authenticate, authorize('super_admin'), users.createUser);
router.put('/:id', authenticate, authorize('super_admin'), users.updateUser);
router.delete('/:id', authenticate, authorize('super_admin'), users.deleteUser);
router.put('/:id/toggle-active', authenticate, authorize('super_admin'), users.toggleUserActive);

export default router;
