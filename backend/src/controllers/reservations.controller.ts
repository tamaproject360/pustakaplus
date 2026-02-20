import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { createError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

function qs(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

/** POST /api/reservations */
export async function createReservation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { collectionId } = req.body as { collectionId?: string };
    if (!collectionId) return next(createError('ID koleksi diperlukan.', 400));

    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) return next(createError('Koleksi tidak ditemukan.', 404));

    const existing = await prisma.reservation.findFirst({
      where: { userId: req.user!.id, collectionId, status: 'menunggu' },
    });
    if (existing) return next(createError('Anda sudah memiliki reservasi aktif untuk koleksi ini.', 400));

    const queueCount = await prisma.reservation.count({
      where: { collectionId, status: 'menunggu' },
    });

    const data = await prisma.reservation.create({
      data: {
        userId: req.user!.id,
        collectionId,
        queuePosition: queueCount + 1,
      },
      include: {
        collection: { select: { id: true, title: true, coverUrl: true, availableCopies: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** GET /api/reservations */
export async function getReservations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = qs(req.query.status);
    const isStaff = ['super_admin', 'pustakawan'].includes(req.user!.role);

    const where: Record<string, unknown> = {};
    if (!isStaff) where.userId = req.user!.id;
    if (status) where.status = status;

    const data = await prisma.reservation.findMany({
      where,
      include: {
        collection: { select: { id: true, title: true, coverUrl: true, availableCopies: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { reservationDate: 'desc' },
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/reservations/:id */
export async function cancelReservation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const reservation = await prisma.reservation.findUnique({ where: { id: req.params.id } });
    if (!reservation) return next(createError('Reservasi tidak ditemukan.', 404));

    const isStaff = ['super_admin', 'pustakawan'].includes(req.user!.role);
    if (!isStaff && reservation.userId !== req.user!.id) {
      return next(createError('Tidak memiliki izin.', 403));
    }

    await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'dibatalkan' },
    });

    res.json({ success: true, message: 'Reservasi berhasil dibatalkan.' });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/reservations/:id/notify */
export async function notifyReservation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: {
        collection: { select: { id: true, title: true, coverUrl: true, availableCopies: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!reservation) return next(createError('Reservasi tidak ditemukan.', 404));

    const data = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'tersedia', notifiedAt: new Date() },
      include: {
        collection: { select: { id: true, title: true, coverUrl: true, availableCopies: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: reservation.userId,
        title: 'Buku Tersedia',
        message: `Buku "${reservation.collection.title}" yang Anda reservasi sudah tersedia.`,
        type: 'success',
      },
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
