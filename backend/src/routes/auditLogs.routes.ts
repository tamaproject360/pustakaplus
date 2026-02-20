import { Router } from 'express';
import * as auditLogs from '../controllers/auditLogs.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('super_admin'), auditLogs.getAuditLogs);

export default router;
