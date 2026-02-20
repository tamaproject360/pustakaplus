import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { createError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

const collectionSchema = z.object({
  title: z.string().min(1),
  author: z.string().optional(),
  publisher: z.string().optional(),
  publishYear: z.number().int().optional(),
  isbn: z.string().optional(),
  issn: z.string().optional(),
  format: z.enum(['buku', 'jurnal', 'ebook', 'multimedia']).default('buku'),
  language: z.string().default('id'),
  subject: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  fileUrl: z.string().optional(),
  barcode: z.string().optional(),
  shelfLocation: z.string().optional(),
  totalCopies: z.number().int().default(1),
  availableCopies: z.number().int().default(1),
  categoryId: z.string().optional(),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

function qs(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

/** GET /api/collections */
export async function getCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = qs(req.query.search);
    const format = qs(req.query.format);
    const categoryId = qs(req.query.categoryId);
    const page = parseInt(qs(req.query.page) ?? '1');
    const limit = parseInt(qs(req.query.limit) ?? '12');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (format && format !== 'all') where.format = format;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        include: {
          category: true,
          tags: true,
          creator: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.collection.count({ where }),
    ]);

    res.json({ success: true, data, meta: { total, page, limit } });
  } catch (err) {
    next(err);
  }
}

/** GET /api/collections/featured */
export async function getFeaturedCollections(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await prisma.collection.findMany({
      where: { isFeatured: true },
      include: { category: true, tags: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** GET /api/collections/:id */
export async function getCollectionById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await prisma.collection.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        tags: true,
        creator: { select: { id: true, name: true } },
      },
    });
    if (!data) return next(createError('Koleksi tidak ditemukan.', 404));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** POST /api/collections */
export async function createCollection(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = collectionSchema.parse(req.body);
    const { tags, ...collectionData } = body;

    if (!collectionData.barcode) {
      collectionData.barcode = `PKP-${Date.now()}`;
    }

    const data = await prisma.collection.create({
      data: {
        ...collectionData,
        createdBy: req.user!.id,
        tags: {
          create: tags.map(tag => ({ tag })),
        },
      },
      include: { category: true, tags: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entityType: 'collections',
        entityId: data.id,
        ipAddress: String(req.ip ?? ''),
      },
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(createError('Data tidak valid: ' + err.errors.map(e => e.message).join(', '), 400));
    }
    next(err);
  }
}

/** PUT /api/collections/:id */
export async function updateCollection(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = collectionSchema.partial().parse(req.body);
    const { tags, ...collectionData } = body;

    const existing = await prisma.collection.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(createError('Koleksi tidak ditemukan.', 404));

    const data = await prisma.collection.update({
      where: { id: req.params.id },
      data: {
        ...collectionData,
        ...(tags !== undefined && {
          tags: {
            deleteMany: {},
            create: tags.map(tag => ({ tag })),
          },
        }),
      },
      include: { category: true, tags: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entityType: 'collections',
        entityId: data.id,
        ipAddress: String(req.ip ?? ''),
      },
    });

    res.json({ success: true, data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(createError('Data tidak valid: ' + err.errors.map(e => e.message).join(', '), 400));
    }
    next(err);
  }
}

/** DELETE /api/collections/:id */
export async function deleteCollection(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.collection.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(createError('Koleksi tidak ditemukan.', 404));

    await prisma.collection.delete({ where: { id: req.params.id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entityType: 'collections',
        entityId: req.params.id,
        ipAddress: String(req.ip ?? ''),
      },
    });

    res.json({ success: true, message: 'Koleksi berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
}
