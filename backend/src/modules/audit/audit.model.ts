import { Schema, model, Types } from 'mongoose';
import { UserRole } from '../users/user.types';

const auditSchema = new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actorRole: { type: String, enum: ['ADMIN', 'WATCHMAN'], required: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: Schema.Types.ObjectId, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} },
  ipAddress: String,
  createdAt: { type: Date, default: Date.now }
});
auditSchema.index({ createdAt: -1 });
export const AuditLog = model('AuditLog', auditSchema);
export async function writeAudit(actorId: string | Types.ObjectId, actorRole: UserRole, action: string, entityType: string, entityId: string | Types.ObjectId | null, metadata: unknown, ipAddress?: string) {
  await AuditLog.create({ actorId, actorRole, action, entityType, entityId, metadata, ipAddress });
}
