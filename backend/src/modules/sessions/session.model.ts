import { Schema, model, Types } from 'mongoose';
import { UserRole } from '../users/user.types';

interface SessionDocument {
  userId: Types.ObjectId;
  role: UserRole;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent?: string;
  ipAddress?: string;
  lastUsedAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<SessionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['ADMIN', 'WATCHMAN'], required: true },
  refreshTokenHash: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  userAgent: String,
  ipAddress: String,
  lastUsedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const Session = model<SessionDocument>('Session', sessionSchema);
