import { Visitor } from '../visitors/visitor.model';
import { Block } from '../blocks/block.model';
import { companyDayRange } from '../../utils/dateTime';
import { applyVisitorDateFilter } from '../../utils/dateTime';

function dateFilter(query: Record<string, unknown>) {
  const filter: Record<string, unknown> = {};
  applyVisitorDateFilter(filter, query);
  if (typeof query.blockId === 'string' && query.blockId) filter.blockId = query.blockId;
  return filter;
}

export async function summary(query: Record<string, unknown>) {
  const filter = dateFilter(query);
  const [total, inside, exited, blocks] = await Promise.all([
    Visitor.countDocuments(filter), Visitor.countDocuments({ ...filter, status: 'INSIDE' }), Visitor.countDocuments({ ...filter, status: 'EXITED' }), Block.countDocuments({ isActive: true })
  ]);
  return { total, inside, exited, activeBlocks: blocks };
}

export async function trend(query: Record<string, unknown>) {
  const filter = dateFilter(query);
  const results = await Visitor.aggregate([{ $match: filter }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkInAt', timezone: 'Asia/Kolkata' } }, visitors: { $sum: 1 }, exited: { $sum: { $cond: [{ $eq: ['$status', 'EXITED'] }, 1, 0] } } } }, { $sort: { _id: 1 } }]);
  return results.map((item) => ({ date: item._id, visitors: item.visitors, exited: item.exited }));
}

export async function blockSummary(query: Record<string, unknown>) {
  const results = await Visitor.aggregate([{ $match: dateFilter(query) }, { $group: { _id: '$blockId', visitors: { $sum: 1 }, inside: { $sum: { $cond: [{ $eq: ['$status', 'INSIDE'] }, 1, 0] } } } }, { $lookup: { from: 'blocks', localField: '_id', foreignField: '_id', as: 'block' } }, { $unwind: '$block' }, { $sort: { visitors: -1 } }]);
  return results.map((item) => ({ blockId: item._id, blockName: item.block.name, code: item.block.code, visitors: item.visitors, inside: item.inside }));
}

export async function exportCsv(query: Record<string, unknown>) {
  const rows = await Visitor.find(dateFilter(query)).populate('blockId', 'name code').sort({ checkInAt: -1 }).limit(10_000);
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return ['Visitor code,Visitor name,Phone,Block,Reason,Person to meet,Check-in,Check-out,Status', ...rows.map((row: any) => [row.visitorCode, row.visitorName, row.phoneNumber, row.blockId?.name, row.reasonForVisit, row.personToMeet, row.checkInAt.toISOString(), row.checkOutAt?.toISOString(), row.status].map(escape).join(','))].join('\n');
}
