import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { createError } from '../utils/errors';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: JwtPayload & { id: string };
}

/**
 * Middleware: Verify JWT and attach user to request
 */
export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(createError('Token autentikasi diperlukan.', 401));
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    // Attach user info - id is same as userId
    req.user = { ...payload, id: payload.userId };
    next();
  } catch {
    next(createError('Token tidak valid atau sudah kadaluarsa.', 401));
  }
}

/**
 * Middleware factory: Restrict access by roles
 */
export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createError('Autentikasi diperlukan.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(createError('Anda tidak memiliki izin untuk mengakses resource ini.', 403));
    }
    next();
  };
}

/**
 * Middleware: Log audit activity
 */
export function auditLog(action: string, entityType: string) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const entityId = req.params.id || undefined;
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action,
          entityType,
          entityId,
          details: req.body ? { body: req.body } : undefined,
          ipAddress: req.ip,
        },
      });
    } catch {
      // Don't block request on audit log failure
    }
    next();
  };
}
