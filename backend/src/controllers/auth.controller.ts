import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/database';
import { signToken } from '../utils/jwt';
import { createError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  unitKerja: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** POST /api/auth/register */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return next(createError('Email sudah terdaftar.', 409));
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        unitKerja: data.unitKerja,
      },
      select: {
        id: true, name: true, email: true, role: true,
        unitKerja: true, avatarUrl: true, isActive: true,
        createdAt: true, updatedAt: true,
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({ success: true, data: { token, user } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(createError('Data tidak valid: ' + err.errors.map(e => e.message).join(', '), 400));
    }
    next(err);
  }
}

/** POST /api/auth/login */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.isActive) {
      return next(createError('Email atau kata sandi salah.', 401));
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      return next(createError('Email atau kata sandi salah.', 401));
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'auth',
        ipAddress: String(req.ip ?? ''),
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, data: { token, user: safeUser } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(createError('Data tidak valid.', 400));
    }
    next(err);
  }
}

/** GET /api/auth/me */
export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, email: true, role: true,
        unitKerja: true, avatarUrl: true, isActive: true,
        createdAt: true, updatedAt: true,
      },
    });
    if (!user) return next(createError('Pengguna tidak ditemukan.', 404));
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/auth/profile */
export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, unitKerja } = req.body as { name?: string; unitKerja?: string };
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, unitKerja },
      select: {
        id: true, name: true, email: true, role: true,
        unitKerja: true, avatarUrl: true, isActive: true,
        createdAt: true, updatedAt: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/logout */
export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'LOGOUT',
          entityType: 'auth',
          ipAddress: String(req.ip ?? ''),
        },
      });
    }
    res.json({ success: true, message: 'Berhasil logout.' });
  } catch (err) {
    next(err);
  }
}
