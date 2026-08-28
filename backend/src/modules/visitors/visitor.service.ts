import { randomUUID } from 'crypto';
import { FilterQuery } from 'mongoose';
import { Visitor, VisitorDocument, VisitorStatus } from './visitor.model';
import { Block } from '../blocks/block.model';
import { AppError } from '../../utils/appError';
import { applyVisitorDateFilter } from '../../utils/dateTime';
import { pagination, paginationMeta } from '../../utils/pagination';
import { writeAudit } from '../audit/audit.model';

type VisitorQuery = Record<string, unknown>;

function buildFilter(query: VisitorQuery, blockId?: string): FilterQuery<VisitorDocument> {
  const filter: FilterQuery<VisitorDocument> = {};
  if (blockId) filter.blockId = blockId;
  if (typeof query.status === 'string' && ['INSIDE', 'EXITED'].includes(query.status)) filter.status = query.status as VisitorStatus;
  if (typeof query.search === 'string' && query.search.trim()) {
    const search = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ visitorName: { $regex: search, $options: 'i' } }, { phoneNumber: { $regex: search, $options: 'i' } }];
  }
  applyVisitorDateFilter(filter as Record<string, unknown>, query);
  return filter;
}

function mapVisitor(item: any) {
  const value = item.toObject ? item.toObject() : item;
  return { ...value, id: String(value._id), block: value.blockId && typeof value.blockId === 'object' ? { id: String(value.blockId._id), name: value.blockId.name, code: value.blockId.code } : value.blockId ? String(value.blockId) : null, blockId: value.blockId && typeof value.blockId === 'object' ? String(value.blockId._id) : String(value.blockId) };
}

export async function listVisitors(query: VisitorQuery, blockId?: string) {
  const { page, limit, skip } = pagination(query);
  const filter = buildFilter(query, blockId);
  const [items, total] = await Promise.all([
    Visitor.find(filter).populate('blockId', 'name code').sort(typeof query.sort === 'string' && query.sort === 'oldest' ? { checkInAt: 1 } : { checkInAt: -1 }).skip(skip).limit(limit),
    Visitor.countDocuments(filter)
  ]);
  return { items: items.map(mapVisitor), meta: paginationMeta(page, limit, total) };
}

export async function getVisitor(id: string, blockId?: string) {
  const visitor = await Visitor.findOne({ _id: id, ...(blockId ? { blockId } : {}) }).populate('blockId', 'name code');
  if (!visitor) throw new AppError('Visitor not found', 404);
  return mapVisitor(visitor);
}

export async function checkIn(data: { visitorName: string; phoneNumber: string; reasonForVisit: string; personToMeet?: string; notes?: string }, userId: string, blockId: string, ip?: string) {
  const block = await Block.findOne({ _id: blockId, isActive: true });
  if (!block) throw new AppError('This block is inactive and cannot accept visitors', 403);
  const visitor = await Visitor.create({ ...data, visitorCode: `V-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 6).toUpperCase()}`, phoneNumber: data.phoneNumber.trim(), blockId, checkInAt: new Date(), status: 'INSIDE', checkedInBy: userId, checkOutAt: null, checkedOutBy: null });
  await writeAudit(userId, 'WATCHMAN', 'VISITOR_CHECKED_IN', 'Visitor', visitor._id, { blockId, visitorCode: visitor.visitorCode }, ip);
  return getVisitor(visitor.id);
}

export async function checkOut(id: string, checkoutAtInput: string | undefined, userId: string, blockId: string, ip?: string) {
  const checkoutAt = checkoutAtInput ? new Date(checkoutAtInput) : new Date();
  if (Number.isNaN(checkoutAt.getTime())) throw new AppError('Invalid checkout time', 422);
  if (checkoutAt.getTime() > Date.now() + 24 * 60 * 60 * 1000) throw new AppError('Checkout time cannot be more than 24 hours in the future', 422);
  const current = await Visitor.findOne({ _id: id, blockId, status: 'INSIDE' }).select('checkInAt visitorName');
  if (!current) throw new AppError('Visitor is already checked out or does not belong to this block', 409);
  if (checkoutAt < current.checkInAt) throw new AppError('Checkout time cannot be earlier than check-in time', 422);
  const visitor = await Visitor.findOneAndUpdate({ _id: id, blockId, status: 'INSIDE' }, { $set: { checkOutAt: checkoutAt, status: 'EXITED', checkedOutBy: userId } }, { new: true }).populate('blockId', 'name code');
  if (!visitor) throw new AppError('Visitor is already checked out or does not belong to this block', 409);
  await writeAudit(userId, 'WATCHMAN', 'VISITOR_CHECKED_OUT', 'Visitor', visitor._id, { blockId, checkoutAt }, ip);
  return mapVisitor(visitor);
}

export async function inside(blockId?: string) { return (await Visitor.find({ status: 'INSIDE', ...(blockId ? { blockId } : {}) }).populate('blockId', 'name code').sort({ checkInAt: -1 })).map(mapVisitor); }
