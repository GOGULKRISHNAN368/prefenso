import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { env } from '../../config/env';
import { User } from '../users/user.model';
import { Block } from '../blocks/block.model';
import { Session } from '../sessions/session.model';
import { writeAudit } from '../audit/audit.model';
import { AppError } from '../../utils/appError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/token';

export type Portal = 'admin' | 'watchman';
export const cookieName = (portal: Portal) => portal === 'admin' ? 'vms_admin_refresh' : 'vms_watchman_refresh';

async function publicUser(user: { id: string; name: string; username: string; role: 'ADMIN' | 'WATCHMAN'; blockId: unknown; isActive: boolean }) {
  const block = user.blockId ? await Block.findById(user.blockId).select('name') : null;
  return { id: user.id, name: user.name, username: user.username, role: user.role, blockId: user.blockId ? String(user.blockId) : null, blockName: block?.name ?? null, isActive: user.isActive };
}

function cookieOptions() {
  const production = env.NODE_ENV === 'production';
  return { httpOnly: true, secure: production, sameSite: production ? 'none' as const : 'lax' as const, maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 86_400_000, path: '/api/auth' };
}

async function issueSession(user: any, req: Request, res: Response, portal: Portal) {
  if (!user) throw new AppError('Invalid username or password', 401);
  const session = new Session({ userId: user._id, role: user.role, refreshTokenHash: 'pending', expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 86_400_000), userAgent: req.get('user-agent')?.slice(0, 500), ipAddress: req.ip });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role, sessionId: session.id, authVersion: user.authVersion });
  session.refreshTokenHash = await bcrypt.hash(refreshToken, env.BCRYPT_ROUNDS);
  await session.save();
  res.cookie(cookieName(portal), refreshToken, cookieOptions());
  return { accessToken: signAccessToken({ sub: user.id, role: user.role, blockId: user.blockId?.toString() ?? null, authVersion: user.authVersion }), user: await publicUser(user) };
}

export async function login(portal: Portal, username: string, password: string, req: Request, res: Response) {
  const user = await User.findOne({ username: username.toLowerCase().trim(), role: portal === 'admin' ? 'ADMIN' : 'WATCHMAN' }).select('+passwordHash');
  const validPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !validPassword || !user.isActive) throw new AppError('Invalid username or password', 401);
  if (portal === 'watchman') {
    if (!user.blockId) throw new AppError('Invalid username or password', 401);
    const block = await Block.findById(user.blockId).select('isActive');
    if (!block?.isActive) throw new AppError('Invalid username or password', 401);
  }
  user.lastLoginAt = new Date();
  await user.save();
  const result = await issueSession(user, req, res, portal);
  await writeAudit(user._id, user.role, `${portal.toUpperCase()}_LOGIN`, 'User', user._id, {}, req.ip);
  return result;
}

export async function refresh(portal: Portal, req: Request, res: Response) {
  const token = req.cookies?.[cookieName(portal)] as string | undefined;
  if (!token) throw new AppError('Session expired', 401);
  try {
    const payload = verifyRefreshToken(token);
    if (payload.role !== (portal === 'admin' ? 'ADMIN' : 'WATCHMAN')) throw new AppError('Session expired', 401);
    const session = await Session.findById(payload.sessionId).select('+refreshTokenHash');
    const user = await User.findById(payload.sub).select('+passwordHash');
    if (!session || !user || session.revokedAt || session.expiresAt <= new Date() || user.authVersion !== payload.authVersion || !user.isActive || !(await bcrypt.compare(token, session.refreshTokenHash))) throw new AppError('Session expired', 401);
    if (portal === 'watchman') {
      const block = user.blockId ? await Block.findById(user.blockId).select('isActive') : null;
      if (!block?.isActive) throw new AppError('Session expired', 401);
    }
    session.revokedAt = new Date();
    await session.save();
    return issueSession(user, req, res, portal);
  } catch (error) {
    res.clearCookie(cookieName(portal), cookieOptions());
    if (error instanceof AppError) throw error;
    throw new AppError('Session expired', 401);
  }
}

export async function logout(portal: Portal, req: Request, res: Response) {
  const token = req.cookies?.[cookieName(portal)] as string | undefined;
  if (token) {
    try { const payload = verifyRefreshToken(token); await Session.findByIdAndUpdate(payload.sessionId, { revokedAt: new Date() }); } catch { /* safe logout */ }
  }
  res.clearCookie(cookieName(portal), cookieOptions());
}
