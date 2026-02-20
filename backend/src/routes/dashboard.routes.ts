import { Router } from 'express';
import * as dashboard from '../controllers/dashboard.controller';
import * as reports from '../controllers/reports.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Dashboard stats
router.get('/stats', authenticate, dashboard.getDashboardStats);

// Categories
router.get('/categories', dashboard.getCategories);
router.post('/categories', authenticate, authorize('pustakawan', 'super_admin'), dashboard.createCategory);

// Reports
router.get('/reports/collections', authenticate, authorize('pustakawan', 'super_admin'), reports.getCollectionsReport);
router.get('/reports/borrowings', authenticate, authorize('pustakawan', 'super_admin'), reports.getBorrowingsReport);
router.get('/reports/knowledges', authenticate, authorize('pustakawan', 'super_admin'), reports.getKnowledgesReport);

export default router;
