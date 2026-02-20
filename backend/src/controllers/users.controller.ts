import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { createError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

function qs(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

/** GET /api/users */
export async function getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = qs(req.query.role);
    const where: Record<string, unknown> = {};
    if (role) where.role = role;

    const data = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true,
        unitKerja: true, avatarUrl: true, isActive: true,
        createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** POST /api/users */
export async function createUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, role, unitKerja } = req.body as {
      name?: string; email?: string; password?: string; role?: string; unitKerja?: string;
    };

    if (!email) return next(createError('Email diperlukan.', 400));

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return next(createError('Email sudah terdaftar.', 409));

    const passwordHash = await bcrypt.hash(password ?? 'password123', 12);
    const data = await prisma.user.create({
      data: {
        name: name ?? '',
        email,
        passwordHash,
        role: (role as 'super_admin' | 'pustakawan' | 'kontributor' | 'pembaca') ?? 'pembaca',
        unitKerja,
      },
      select: {
        id: true, name: true, email: true, role: true,
        unitKerja: true, avatarUrl: true, isActive: true,
        createdAt: true, updatedAt: true,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/users/:id */
export async function updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, role, unitKerja, isActive } = req.body as {
      name?: string; role?: string; unitKerja?: string; isActive?: boolean;
    };

    const data = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name,
        role: role as 'super_admin' | 'pustakawan' | 'kontributor' | 'pembaca' | undefined,
        unitKerja,
        isActive,
      },
      select: {
        id: true, name: true, email: true, role: true,
        unitKerja: true, avatarUrl: true, isActive: true,
        createdAt: true, updatedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_USER',
        entityType: 'users',
        entityId: req.params.id,
        ipAddress: String(req.ip ?? ''),
      },
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/users/:id */
export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.params.id === req.user!.id) {
      return next(createError('Tidak dapat menghapus akun sendiri.', 400));
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Pengguna berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/users/:id/toggle-active */
export async function toggleUserActive(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return next(createError('Pengguna tidak ditemukan.', 404));

    const data = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: {
        id: true, name: true, email: true, role: true,
        unitKerja: true, avatarUrl: true, isActive: true,
        createdAt: true, updatedAt: true,
      },
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
