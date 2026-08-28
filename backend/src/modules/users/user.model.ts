import { Schema, model, Types, HydratedDocument } from 'mongoose';
import { UserRole } from './user.types';

export interface UserDocument {
  name: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  blockId: Types.ObjectId | null;
  isActive: boolean;
  authVersion: number;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['ADMIN', 'WATCHMAN'], required: true },
  blockId: { type: Schema.Types.ObjectId, ref: 'Block', default: null },
  isActive: { type: Boolean, default: true },
  authVersion: { type: Number, default: 0 },
  lastLoginAt: { type: Date, default: null }
}, { timestamps: true });

userSchema.pre('validate', function (next) {
  if (this.role === 'ADMIN' && this.blockId) return next(new Error('Admin users cannot be assigned to a block'));
  if (this.role === 'WATCHMAN' && !this.blockId) return next(new Error('Watchman users must be assigned to a block'));
  next();
});

userSchema.index({ blockId: 1, role: 1 }, { unique: true, partialFilterExpression: { role: 'WATCHMAN', blockId: { $type: 'objectId' } } });
export const User = model<UserDocument>('User', userSchema);
export type UserDoc = HydratedDocument<UserDocument>;
