import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { createError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

function qs(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

/** POST /api/borrowings - Borrow a book */
export async function createBorrowing(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { collectionId, dueDate } = req.body as { collectionId?: string; dueDate?: string };
    if (!collectionId) return next(createError('ID koleksi diperlukan.', 400));

    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) return next(createError('Koleksi tidak ditemukan.', 404));
    if (collection.availableCopies <= 0) return next(createError('Tidak ada salinan yang tersedia.', 400));

    const computedDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const [borrowing] = await prisma.$transaction([
      prisma.borrowing.create({
        data: {
          userId: req.user!.id,
          collectionId,
          dueDate: computedDueDate,
        },
        include: {
          collection: { select: { id: true, title: true, coverUrl: true, format: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.collection.update({
        where: { id: collectionId },
        data: { availableCopies: { decrement: 1 } },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'BORROW',
        entityType: 'borrowings',
        entityId: borrowing.id,
        ipAddress: String(req.ip ?? ''),
      },
    });

    res.status(201).json({ success: true, data: borrowing });
  } catch (err) {
    next(err);
  }
}

/** GET /api/borrowings */
export async function getBorrowings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = qs(req.query.status);
    const userId = qs(req.query.userId);
    const page = parseInt(qs(req.query.page) ?? '1');
    const limit = parseInt(qs(req.query.limit) ?? '20');
    const skip = (page - 1) * limit;

    const isStaff = ['super_admin', 'pustakawan'].includes(req.user!.role);
    const where: Record<string, unknown> = {};

    if (!isStaff) {
      where.userId = req.user!.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.borrowing.findMany({
        where,
        include: {
          collection: { select: { id: true, title: true, coverUrl: true, format: true } },
          user: { select: { id: true, name: true, email: true } },
          processor: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.borrowing.count({ where }),
    ]);

    res.json({ success: true, data, meta: { total, page, limit } });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/borrowings/:id/return */
export async function returnBorrowing(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const borrowing = await prisma.borrowing.findUnique({
      where: { id: req.params.id },
      include: { collection: true },
    });
    if (!borrowing) return next(createError('Peminjaman tidak ditemukan.', 404));
    if (borrowing.status === 'dikembalikan') return next(createError('Buku sudah dikembalikan.', 400));

    const returnDate = new Date();
    const isLate = returnDate > borrowing.dueDate;
    let fineAmount = 0;

    if (isLate) {
      const daysLate = Math.ceil((returnDate.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      fineAmount = daysLate * 1000;
    }

    const [updated] = await prisma.$transaction([
      prisma.borrowing.update({
        where: { id: req.params.id },
        data: {
          returnDate,
          status: 'dikembalikan',
          fineAmount,
          processedBy: req.user!.id,
        },
        include: {
          collection: { select: { id: true, title: true, coverUrl: true, format: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.collection.update({
        where: { id: borrowing.collectionId },
        data: { availableCopies: { increment: 1 } },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'RETURN',
        entityType: 'borrowings',
        entityId: req.params.id,
        ipAddress: String(req.ip ?? ''),
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
