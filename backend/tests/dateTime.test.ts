import { describe, expect, it } from 'vitest';
import { companyDayRange, formatDuration } from '../src/utils/dateTime';

describe('company timezone utilities', () => {
  it('converts an Asia/Kolkata calendar day into UTC boundaries', () => {
    const range = companyDayRange('2026-08-28');
    expect(range.start.toISOString()).toBe('2026-08-27T18:30:00.000Z');
    expect(range.end.toISOString()).toBe('2026-08-28T18:30:00.000Z');
  });

  it('formats visitor durations for the operator UI', () => {
    expect(formatDuration(new Date('2026-08-28T10:00:00Z'), new Date('2026-08-28T10:12:00Z'))).toBe('12 min');
    expect(formatDuration(new Date('2026-08-28T10:00:00Z'), new Date('2026-08-28T11:15:00Z'))).toBe('1 hr 15 min');
  });
});
