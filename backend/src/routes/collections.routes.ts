import { Router } from 'express';
import * as collections from '../controllers/collections.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/featured', collections.getFeaturedCollections);
router.get('/', collections.getCollections);
router.get('/:id', collections.getCollectionById);
router.post('/', authenticate, authorize('pustakawan', 'super_admin'), collections.createCollection);
router.put('/:id', authenticate, authorize('pustakawan', 'super_admin'), collections.updateCollection);
router.delete('/:id', authenticate, authorize('pustakawan', 'super_admin'), collections.deleteCollection);

export default router;
