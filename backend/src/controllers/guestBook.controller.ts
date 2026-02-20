import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { createError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

function qs(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

/** POST /api/guest-book/check-in */
export async function checkIn(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { purpose, purposeNote } = req.body as { purpose?: string; purposeNote?: string };
    if (!purpose) return next(createError('Tujuan kunjungan diperlukan.', 400));

    const data = await prisma.guestBook.create({
      data: {
        userId: req.user!.id,
        purpose: purpose as 'pinjam_buku' | 'baca_di_tempat' | 'riset' | 'meeting' | 'lainnya',
        purposeNote,
      },
      include: { user: { select: { id: true, name: true, unitKerja: true } } },
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/guest-book/:id/check-out */
export async function checkOut(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const entry = await prisma.guestBook.findUnique({ where: { id: req.params.id } });
    if (!entry) return next(createError('Entri tidak ditemukan.', 404));
    if (entry.userId !== req.user!.id) return next(createError('Tidak memiliki izin.', 403));

    const data = await prisma.guestBook.update({
      where: { id: req.params.id },
      data: { checkOutTime: new Date() },
      include: { user: { select: { id: true, name: true, unitKerja: true } } },
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** GET /api/guest-book */
export async function getGuestBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = qs(req.query.userId);
    const isStaff = ['super_admin', 'pustakawan'].includes(req.user!.role);

    const where: Record<string, unknown> = {};
    if (!isStaff) where.userId = req.user!.id;
    else if (userId) where.userId = userId;

    const data = await prisma.guestBook.findMany({
      where,
      include: { user: { select: { id: true, name: true, unitKerja: true } } },
      orderBy: { visitDate: 'desc' },
      take: 100,
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** GET /api/guest-book/stats */
export async function getGuestBookStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [today, thisWeek, thisMonth] = await Promise.all([
      prisma.guestBook.count({ where: { visitDate: { gte: todayStart } } }),
      prisma.guestBook.count({ where: { visitDate: { gte: weekStart } } }),
      prisma.guestBook.count({ where: { visitDate: { gte: monthStart } } }),
    ]);

    res.json({ success: true, data: { today, thisWeek, thisMonth } });
  } catch (err) {
    next(err);
  }
}
