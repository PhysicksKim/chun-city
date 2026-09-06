import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';

export const DEFAULT_TIMEZONE = 'Asia/Seoul';

export const getCalendarDateRange = (month: Date) => ({
  startDate: format(startOfWeek(startOfMonth(month)), 'yyyy-MM-dd'),
  endDate: format(endOfWeek(endOfMonth(month)), 'yyyy-MM-dd'),
});

export const getTodayDateString = (timezone: string = DEFAULT_TIMEZONE) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
    });
    return formatter.format(new Date());
  } catch (error) {
    console.warn('Invalid timezone, fallback to default', timezone, error);
    const fallbackFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: DEFAULT_TIMEZONE,
    });
    return fallbackFormatter.format(new Date());
  }
};

export const isValidDateInput = (date?: string) =>
  !!date && /^\d{4}-\d{2}-\d{2}$/.test(date);
