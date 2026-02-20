import { Router } from 'express';
import * as knowledges from '../controllers/knowledges.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', knowledges.getKnowledges);
router.get('/:id', knowledges.getKnowledgeById);
router.post('/', authenticate, authorize('kontributor', 'pustakawan', 'super_admin'), knowledges.createKnowledge);
router.put('/:id', authenticate, knowledges.updateKnowledge);
router.put('/:id/submit', authenticate, knowledges.submitKnowledge);
router.put('/:id/review', authenticate, authorize('pustakawan', 'super_admin'), knowledges.reviewKnowledge);
router.delete('/:id', authenticate, knowledges.deleteKnowledge);
router.post('/:id/rating', authenticate, knowledges.rateKnowledge);

export default router;
