import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

function qs(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

/** GET /api/audit-logs */
export async function getAuditLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const entityType = qs(req.query.entityType);
    const page = parseInt(qs(req.query.page) ?? '1');
    const limit = parseInt(qs(req.query.limit) ?? '50');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ success: true, data, meta: { total, page, limit } });
  } catch (err) {
    next(err);
  }
}
