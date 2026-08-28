import { Visitor } from '../visitors/visitor.model';
import { Block } from '../blocks/block.model';
import { companyDayRange } from '../../utils/dateTime';

export async function dashboard(blockId?: string) {
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const { start, end } = companyDayRange(date);
  const scope = blockId ? { blockId } : {};
  const [visitorsToday, inside, exitedToday, activeBlocks, recentVisitors, activity] = await Promise.all([
    Visitor.countDocuments({ ...scope, checkInAt: { $gte: start, $lt: end } }),
    Visitor.countDocuments({ ...scope, status: 'INSIDE' }),
    Visitor.countDocuments({ ...scope, status: 'EXITED', checkOutAt: { $gte: start, $lt: end } }),
    Block.countDocuments({ isActive: true }),
    Visitor.find(scope).populate('blockId', 'name code').sort({ checkInAt: -1 }).limit(8),
    Visitor.aggregate([{ $match: { ...scope, checkInAt: { $gte: new Date(start.getTime() - 6 * 86_400_000), $lt: end } } }, { $group: { _id: { $dateToString: { date: '$checkInAt', format: '%Y-%m-%d', timezone: 'Asia/Kolkata' } }, visitors: { $sum: 1 }, exited: { $sum: { $cond: [{ $eq: ['$status', 'EXITED'] }, 1, 0] } } } }, { $sort: { _id: 1 } }])
  ]);
  const recent = recentVisitors.map((visitor: any) => {
    const value = visitor.toObject();
    return { ...value, id: visitor.id, blockId: visitor.blockId?._id?.toString() ?? visitor.blockId?.toString(), block: visitor.blockId ? { id: visitor.blockId._id.toString(), name: visitor.blockId.name, code: visitor.blockId.code } : null };
  });
  return { visitorsToday, inside, exitedToday, activeBlocks, recentVisitors: recent, activity: activity.map((item) => ({ date: item._id, visitors: item.visitors, exited: item.exited })) };
}
