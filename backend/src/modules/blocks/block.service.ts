import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { env } from '../../config/env';
import { AppError } from '../../utils/appError';
import { Block } from './block.model';
import { User } from '../users/user.model';
import { Session } from '../sessions/session.model';
import { Visitor } from '../visitors/visitor.model';
import { writeAudit } from '../audit/audit.model';

async function blockView(block: any) {
  const watchman = await User.findOne({ blockId: block._id, role: 'WATCHMAN' }).select('name username isActive');
  const insideCount = await Visitor.countDocuments({ blockId: block._id, status: 'INSIDE' });
  return { ...block.toObject(), id: block.id, watchman: watchman ? { id: watchman.id, name: watchman.name, username: watchman.username, isActive: watchman.isActive } : null, insideCount };
}

export async function listBlocks() { return Promise.all((await Block.find().sort({ displayOrder: 1, name: 1 })).map(blockView)); }
export async function getBlock(id: string) { const block = await Block.findById(id); if (!block) throw new AppError('Block not found', 404); return blockView(block); }

export async function createBlock(data: { name: string; code: string; displayOrder?: number }, adminId: string, ip?: string) {
  const block = await Block.create({ ...data, code: data.code.toUpperCase(), createdBy: adminId });
  await writeAudit(adminId, 'ADMIN', 'BLOCK_CREATED', 'Block', block._id, { name: block.name, code: block.code }, ip);
  return getBlock(block.id);
}

export async function updateBlock(id: string, data: { name?: string; code?: string; displayOrder?: number }, adminId: string, ip?: string) {
  const block = await Block.findByIdAndUpdate(id, { ...data, ...(data.code ? { code: data.code.toUpperCase() } : {}) }, { new: true, runValidators: true });
  if (!block) throw new AppError('Block not found', 404);
  await writeAudit(adminId, 'ADMIN', 'BLOCK_UPDATED', 'Block', block._id, data, ip);
  return getBlock(id);
}

export async function configureCredentials(blockId: string, data: { name: string; username: string; password: string }, adminId: string, ip?: string) {
  const block = await Block.findById(blockId);
  if (!block) throw new AppError('Block not found', 404);
  const username = data.username.toLowerCase();
  const duplicate = await User.findOne({ username, ...(block.credentialsConfigured ? { blockId: { $ne: block._id } } : {}) });
  if (duplicate) throw new AppError('That username is already in use', 409);
  const existing = await User.findOne({ blockId: block._id, role: 'WATCHMAN' }).select('+passwordHash');
  const user = existing ?? new User({ blockId: block._id, role: 'WATCHMAN', authVersion: 0 });
  user.name = data.name; user.username = username; user.passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS); user.isActive = true;
  await user.save();
  block.credentialsConfigured = true; await block.save();
  await Session.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
  user.authVersion += 1; await user.save();
  await writeAudit(adminId, 'ADMIN', 'WATCHMAN_CREDENTIALS_CONFIGURED', 'User', user._id, { blockId }, ip);
  return getBlock(blockId);
}

export async function resetPassword(blockId: string, password: string, adminId: string, ip?: string) {
  const user = await User.findOne({ blockId, role: 'WATCHMAN' }).select('+passwordHash');
  if (!user) throw new AppError('Configure Watchman credentials before resetting a password', 404);
  user.passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS); user.authVersion += 1; await user.save();
  await Session.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
  await writeAudit(adminId, 'ADMIN', 'WATCHMAN_PASSWORD_RESET', 'User', user._id, { blockId }, ip);
  return getBlock(blockId);
}

export async function setBlockStatus(blockId: string, isActive: boolean, adminId: string, ip?: string) {
  const block = await Block.findByIdAndUpdate(blockId, { isActive }, { new: true });
  if (!block) throw new AppError('Block not found', 404);
  if (!isActive) {
    const user = await User.findOne({ blockId, role: 'WATCHMAN' });
    if (user) { user.authVersion += 1; await user.save(); await Session.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() }); }
  }
  await writeAudit(adminId, 'ADMIN', isActive ? 'BLOCK_ACTIVATED' : 'BLOCK_DEACTIVATED', 'Block', block._id, {}, ip);
  return getBlock(blockId);
}
