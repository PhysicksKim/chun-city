import { describe, expect, it } from 'vitest';
import { getCalendarDateRange } from '../src/renderer/pages/app/v1/utils/date';

describe('getCalendarDateRange', () => {
  it('includes the leading and trailing days displayed for September 2026', () => {
    expect(getCalendarDateRange(new Date(2026, 8, 1))).toEqual({
      startDate: '2026-08-30',
      endDate: '2026-10-03',
    });
  });
});
