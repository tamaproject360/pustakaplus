import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

/** GET /api/notifications */
export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/notifications/:id/read */
export async function markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'Notifikasi ditandai sudah dibaca.' });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/notifications/read-all */
export async function markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca.' });
  } catch (err) {
    next(err);
  }
}
