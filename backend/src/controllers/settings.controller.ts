import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

function qs(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

/** GET /api/settings */
export async function getSettings(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await prisma.systemConfig.findMany({ orderBy: { key: 'asc' } });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/settings/:key */
export async function updateSetting(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { value } = req.body as { value?: string };
    if (value === undefined) {
      res.status(400).json({ success: false, message: 'Value diperlukan.' });
      return;
    }

    const data = await prisma.systemConfig.upsert({
      where: { key: req.params.key },
      create: {
        key: req.params.key,
        value,
        updatedBy: req.user!.id,
      },
      update: {
        value,
        updatedBy: req.user!.id,
      },
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
