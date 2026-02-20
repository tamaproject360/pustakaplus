import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

function qs(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

/** GET /api/dashboard/stats */
export async function getDashboardStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalCollections,
      totalBorrowings,
      activeBorrowings,
      publishedKnowledge,
      totalKnowledge,
      totalUsers,
      totalVisits,
      overdueItems,
      pendingReviews,
      recentBorrowings,
      recentKnowledge,
    ] = await Promise.all([
      prisma.collection.count(),
      prisma.borrowing.count(),
      prisma.borrowing.count({ where: { status: 'dipinjam' } }),
      prisma.knowledge.count({ where: { status: 'published' } }),
      prisma.knowledge.count(),
      prisma.user.count(),
      prisma.guestBook.count(),
      prisma.borrowing.count({ where: { status: 'terlambat' } }),
      prisma.knowledge.count({ where: { status: 'submitted' } }),
      prisma.borrowing.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          collection: { select: { title: true, coverUrl: true } },
          user: { select: { name: true } },
        },
      }),
      prisma.knowledge.findMany({
        where: { status: 'published' },
        take: 5,
        orderBy: { publishedAt: 'desc' },
        include: { submitter: { select: { name: true } } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalCollections,
        totalBorrowings,
        activeBorrowings,
        publishedKnowledge,
        totalKnowledge,
        totalUsers,
        totalVisits,
        overdueItems,
        pendingReviews,
        recentBorrowings,
        recentKnowledge,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/dashboard/categories */
export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const type = qs(req.query.type);
    const where = type ? { type: type as 'perpustakaan' | 'knowledge' } : {};
    const data = await prisma.category.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** POST /api/dashboard/categories */
export async function createCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, slug, type, parentId } = req.body as {
      name?: string; slug?: string; type?: string; parentId?: string;
    };

    if (!name || !slug || !type) {
      res.status(400).json({ success: false, message: 'name, slug, type diperlukan.' });
      return;
    }

    const data = await prisma.category.create({
      data: {
        name,
        slug,
        type: type as 'perpustakaan' | 'knowledge',
        parentId,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
