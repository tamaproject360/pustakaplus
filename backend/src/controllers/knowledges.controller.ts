import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { createError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

function qs(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

const knowledgeSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  summary: z.string().optional(),
  type: z.enum(['artikel', 'sop', 'panduan', 'lesson_learned', 'best_practice']),
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

/** GET /api/knowledges */
export async function getKnowledges(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = qs(req.query.search);
    const type = qs(req.query.type);
    const categoryId = qs(req.query.categoryId);
    const status = qs(req.query.status);
    const sort = qs(req.query.sort) ?? 'newest';
    const page = parseInt(qs(req.query.page) ?? '1');
    const limit = parseInt(qs(req.query.limit) ?? '12');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    const reqAuth = req as AuthRequest;
    const isStaff = reqAuth.user && ['super_admin', 'pustakawan', 'kontributor'].includes(reqAuth.user.role);
    if (!isStaff) {
      where.status = 'published';
    } else if (status) {
      where.status = status;
    }

    if (type && type !== 'all') where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy =
      sort === 'popular' ? { viewsCount: 'desc' as const } :
      sort === 'rating' ? { averageRating: 'desc' as const } :
      { createdAt: 'desc' as const };

    const [data, total] = await Promise.all([
      prisma.knowledge.findMany({
        where,
        include: {
          category: true,
          tags: true,
          submitter: { select: { id: true, name: true } },
          reviewer: { select: { id: true, name: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.knowledge.count({ where }),
    ]);

    res.json({ success: true, data, meta: { total, page, limit } });
  } catch (err) {
    next(err);
  }
}

/** GET /api/knowledges/:id */
export async function getKnowledgeById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await prisma.knowledge.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        tags: true,
        submitter: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } },
        ratings: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!data) return next(createError('Knowledge tidak ditemukan.', 404));

    await prisma.knowledge.update({
      where: { id: req.params.id },
      data: { viewsCount: { increment: 1 } },
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** POST /api/knowledges */
export async function createKnowledge(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = knowledgeSchema.parse(req.body);
    const { tags, ...knowledgeData } = body;

    const data = await prisma.knowledge.create({
      data: {
        ...knowledgeData,
        submittedBy: req.user!.id,
        tags: { create: tags.map(tag => ({ tag })) },
      },
      include: { category: true, tags: true },
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(createError('Data tidak valid: ' + err.errors.map(e => e.message).join(', '), 400));
    }
    next(err);
  }
}

/** PUT /api/knowledges/:id */
export async function updateKnowledge(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = knowledgeSchema.partial().parse(req.body);
    const { tags, ...knowledgeData } = body;

    const existing = await prisma.knowledge.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(createError('Knowledge tidak ditemukan.', 404));

    const isStaff = ['super_admin', 'pustakawan'].includes(req.user!.role);
    if (!isStaff && existing.submittedBy !== req.user!.id) {
      return next(createError('Tidak memiliki izin.', 403));
    }

    const data = await prisma.knowledge.update({
      where: { id: req.params.id },
      data: {
        ...knowledgeData,
        ...(tags !== undefined && {
          tags: {
            deleteMany: {},
            create: tags.map(tag => ({ tag })),
          },
        }),
      },
      include: { category: true, tags: true },
    });

    res.json({ success: true, data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(createError('Data tidak valid: ' + err.errors.map(e => e.message).join(', '), 400));
    }
    next(err);
  }
}

/** PUT /api/knowledges/:id/submit */
export async function submitKnowledge(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.knowledge.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(createError('Knowledge tidak ditemukan.', 404));
    if (existing.submittedBy !== req.user!.id) return next(createError('Tidak memiliki izin.', 403));

    const data = await prisma.knowledge.update({
      where: { id: req.params.id },
      data: { status: 'submitted' },
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/knowledges/:id/review */
export async function reviewKnowledge(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { action, rejectionFeedback } = req.body as { action?: string; rejectionFeedback?: string };
    if (!action || !['approve', 'reject'].includes(action)) {
      return next(createError('Action harus approve atau reject.', 400));
    }

    const updateData: Record<string, unknown> = {
      reviewedBy: req.user!.id,
    };

    if (action === 'approve') {
      updateData.status = 'published';
      updateData.publishedAt = new Date();
    } else {
      updateData.status = 'rejected';
      updateData.rejectionFeedback = rejectionFeedback;
    }

    const data = await prisma.knowledge.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/knowledges/:id */
export async function deleteKnowledge(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.knowledge.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(createError('Knowledge tidak ditemukan.', 404));

    const isStaff = ['super_admin', 'pustakawan'].includes(req.user!.role);
    if (!isStaff && existing.submittedBy !== req.user!.id) {
      return next(createError('Tidak memiliki izin.', 403));
    }

    await prisma.knowledge.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Knowledge berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
}

/** POST /api/knowledges/:id/rating */
export async function rateKnowledge(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { rating, review } = req.body as { rating?: number; review?: string };
    if (!rating || rating < 1 || rating > 5) {
      return next(createError('Rating harus antara 1-5.', 400));
    }

    const knowledgeId = req.params.id;
    const userId = req.user!.id;

    const existing = await prisma.rating.findUnique({
      where: { knowledgeId_userId: { knowledgeId, userId } },
    });

    let data;
    if (existing) {
      data = await prisma.rating.update({
        where: { id: existing.id },
        data: { rating, review },
        include: { user: { select: { id: true, name: true } } },
      });
    } else {
      data = await prisma.rating.create({
        data: { knowledgeId, userId, rating, review },
        include: { user: { select: { id: true, name: true } } },
      });
    }

    const aggr = await prisma.rating.aggregate({
      where: { knowledgeId },
      _avg: { rating: true },
    });
    await prisma.knowledge.update({
      where: { id: knowledgeId },
      data: { averageRating: aggr._avg.rating ?? 0 },
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
