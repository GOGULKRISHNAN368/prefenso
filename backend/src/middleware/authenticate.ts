import { NextFunction, Request, Response } from 'express';
import { User } from '../modules/users/user.model';
import { verifyAccessToken } from '../utils/token';
import { AppError } from '../utils/appError';

declare global { namespace Express { interface Request { user?: { id: string; name: string; username: string; role: 'ADMIN' | 'WATCHMAN'; blockId: string | null; isActive: boolean }; } } }

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new AppError('Authentication required', 401);
    const payload = verifyAccessToken(header.slice(7));
    const user = await User.findById(payload.sub).select('+passwordHash');
    if (!user || !user.isActive || user.authVersion !== payload.authVersion) throw new AppError('Session is no longer valid', 401);
    req.user = { id: user.id, name: user.name, username: user.username, role: user.role, blockId: user.blockId?.toString() ?? null, isActive: user.isActive };
    next();
  } catch (error) { next(error instanceof AppError ? error : new AppError('Authentication required', 401)); }
}
