import { env } from '../config/env';
import { AppError } from './appError';

export function getTimezoneOffsetMs(date: Date, timeZone = env.COMPANY_TIMEZONE): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' }).formatToParts(date);
  const offset = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
  const match = offset.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return (match[1] === '+' ? 1 : -1) * minutes * 60_000;
}

export function companyDayRange(dateString: string): { start: Date; end: Date } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) throw new AppError('Invalid date. Use YYYY-MM-DD.', 422);
  const [year, month, day] = dateString.split('-').map(Number);
  const localMidnightAsUtc = new Date(Date.UTC(year, month - 1, day));
  const offset = getTimezoneOffsetMs(localMidnightAsUtc);
  const start = new Date(localMidnightAsUtc.getTime() - offset);
  return { start, end: new Date(start.getTime() + 86_400_000) };
}

export function applyVisitorDateFilter(filter: Record<string, unknown>, query: Record<string, unknown>) {
  const date = typeof query.date === 'string' ? query.date : undefined;
  const startDate = typeof query.startDate === 'string' ? query.startDate : undefined;
  const endDate = typeof query.endDate === 'string' ? query.endDate : undefined;
  if (date) {
    const range = companyDayRange(date);
    filter.checkInAt = { $gte: range.start, $lt: range.end };
  } else if (startDate || endDate) {
    const range: Record<string, Date> = {};
    if (startDate) range.$gte = companyDayRange(startDate).start;
    if (endDate) range.$lt = companyDayRange(endDate).end;
    filter.checkInAt = range;
  }
  return filter;
}

export function formatDuration(from: Date, to = new Date()): string {
  const minutes = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60_000));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ''}`;
}
