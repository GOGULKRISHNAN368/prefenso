import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../modules/users/user.types';

export type AccessPayload = { sub: string; role: UserRole; blockId: string | null; authVersion: number; type: 'access' };
export type RefreshPayload = { sub: string; role: UserRole; sessionId: string; authVersion: number; type: 'refresh' };

export function signAccessToken(payload: Omit<AccessPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN } as jwt.SignOptions);
}

export function signRefreshToken(payload: Omit<RefreshPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, env.JWT_REFRESH_SECRET, { expiresIn: `${env.REFRESH_TOKEN_EXPIRES_DAYS}d` });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
}
