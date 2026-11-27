import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  format,
  getDaysInMonth,
  isValid,
  parse,
  subMonths,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { RecurringFrequency } from '@/db/types';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Mengambil tanggal kalender lokal YYYY-MM-DD (RULE-012) tanpa konversi UTC.
 */
export function getLocalToday(now: Date = new Date()): string {
  return format(now, 'yyyy-MM-dd');
}

/**
 * Mengambil bulan kalender lokal YYYY-MM.
 */
export function getLocalMonth(now: Date = new Date()): string {
  return format(now, 'yyyy-MM');
}

export function parseLocalDate(dateStr: string): Date {
  return parse(dateStr, 'yyyy-MM-dd', new Date());
}

export function isValidCalendarDate(dateStr: string): boolean {
  if (!DATE_REGEX.test(dateStr)) return false;
  const parsed = parseLocalDate(dateStr);
  return isValid(parsed) && format(parsed, 'yyyy-MM-dd') === dateStr;
}

export function isValidMonthString(monthStr: string): boolean {
  return MONTH_REGEX.test(monthStr);
}

export function getMonthDateBounds(monthStr: string): { startDate: string; endDate: string } {
  const firstDay = parse(`${monthStr}-01`, 'yyyy-MM-dd', new Date());
  const lastDay = endOfMonth(firstDay);
  return {
    startDate: format(firstDay, 'yyyy-MM-dd'),
    endDate: format(lastDay, 'yyyy-MM-dd'),
  };
}

export function shiftMonth(monthStr: string, deltaMonths: number): string {
  const base = parse(`${monthStr}-01`, 'yyyy-MM-dd', new Date());
  const shifted = deltaMonths >= 0 ? addMonths(base, deltaMonths) : subMonths(base, Math.abs(deltaMonths));
  return format(shifted, 'yyyy-MM');
}

export function formatIndonesianDate(dateStr: string, pattern = 'd MMM yyyy'): string {
  if (!isValidCalendarDate(dateStr)) return dateStr;
  return format(parseLocalDate(dateStr), pattern, { locale: idLocale });
}

export function formatIndonesianMonth(monthStr: string): string {
  if (!isValidMonthString(monthStr)) return monthStr;
  const parsed = parse(`${monthStr}-01`, 'yyyy-MM-dd', new Date());
  return format(parsed, 'MMMM yyyy', { locale: idLocale });
}

export function getCalendarDaysDifference(laterDate: string, earlierDate: string): number {
  return differenceInCalendarDays(parseLocalDate(laterDate), parseLocalDate(earlierDate));
}

export function extractDayOfMonth(dateStr: string): number {
  return Number(dateStr.slice(8, 10));
}

/**
 * Menghitung tanggal occurrence berikutnya dengan end-of-month clamping (RULE-014).
 */
export function computeNextOccurrenceDate(
  params: {
    frequency: RecurringFrequency;
    interval: number;
    anchorDay: number | null;
    startDate: string;
  },
  currentOccDate: string
): string {
  const current = parseLocalDate(currentOccDate);
  const safeInterval = Math.max(1, Math.trunc(params.interval));

  switch (params.frequency) {
    case 'daily':
      return format(addDays(current, safeInterval), 'yyyy-MM-dd');
    case 'weekly':
      return format(addWeeks(current, safeInterval), 'yyyy-MM-dd');
    case 'monthly': {
      const targetMonthStart = addMonths(
        new Date(current.getFullYear(), current.getMonth(), 1),
        safeInterval
      );
      const anchor = params.anchorDay ?? extractDayOfMonth(params.startDate);
      const maxDay = getDaysInMonth(targetMonthStart);
      const clampedDay = Math.min(Math.max(1, anchor), maxDay);
      const result = new Date(
        targetMonthStart.getFullYear(),
        targetMonthStart.getMonth(),
        clampedDay
      );
      return format(result, 'yyyy-MM-dd');
    }
    case 'yearly': {
      const startParsed = parseLocalDate(params.startDate);
      const targetYear = current.getFullYear() + safeInterval;
      const targetMonthIndex = startParsed.getMonth();
      const targetMonthStart = new Date(targetYear, targetMonthIndex, 1);
      const anchor = startParsed.getDate();
      const maxDay = getDaysInMonth(targetMonthStart);
      const clampedDay = Math.min(anchor, maxDay);
      const result = new Date(targetYear, targetMonthIndex, clampedDay);
      return format(result, 'yyyy-MM-dd');
    }
  }
}

/**
 * Menghasilkan daftar pratinjau N tanggal jadwal berikutnya dari aturan berulang.
 */
export function previewNextOccurrences(
  params: {
    frequency: RecurringFrequency;
    interval: number;
    anchorDay: number | null;
    startDate: string;
    endDate: string | null;
    nextRunDate?: string;
  },
  count = 3
): string[] {
  const results: string[] = [];
  let cursor = params.nextRunDate ?? params.startDate;
  for (let i = 0; i < count; i++) {
    if (params.endDate && cursor > params.endDate) break;
    results.push(cursor);
    cursor = computeNextOccurrenceDate(params, cursor);
  }
  return results;
}

export function getLastNMonthsList(endMonth: string, count: number): string[] {
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    months.push(shiftMonth(endMonth, -i));
  }
  return months;
}

export function getMonthShortLabel(monthStr: string): string {
  if (!isValidMonthString(monthStr)) return monthStr;
  const parsed = parse(`${monthStr}-01`, 'yyyy-MM-dd', new Date());
  return format(parsed, 'MMM yy', { locale: idLocale });
}

export function addYearsLocal(dateStr: string, years: number): string {
  return format(addYears(parseLocalDate(dateStr), years), 'yyyy-MM-dd');
}
