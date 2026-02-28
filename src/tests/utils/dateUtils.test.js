/**
 * @file dateUtils.test.js
 * @description Unit tests for date utility functions.
 */

import { describe, it, expect } from 'vitest';
import {
  getMonthGridDays,
  getWeekDays,
  nextMonth,
  prevMonth,
  nextWeek,
  prevWeek,
  formatMonthYear,
  formatDayNumber,
  formatISO,
  formatTime,
  formatFullDate,
  isSameMonthAs,
  isSameDayAs,
  isToday,
  safeParseISO,
  toStartOfDay,
} from '../../utils/dateUtils';

/* Fixed reference date: Saturday, February 28, 2026 */
const REF_DATE = new Date(2026, 1, 28);

describe('dateUtils', () => {
  /* ---- Grid generation ---- */

  describe('getMonthGridDays', () => {
    it('returns an array whose length is a multiple of 7', () => {
      const days = getMonthGridDays(REF_DATE);
      expect(days.length % 7).toBe(0);
    });

    it('starts on a Monday', () => {
      const days = getMonthGridDays(REF_DATE);
      expect(days[0].getDay()).toBe(1); // Monday
    });

    it('ends on a Sunday', () => {
      const days = getMonthGridDays(REF_DATE);
      expect(days[days.length - 1].getDay()).toBe(0); // Sunday
    });

    it('includes the first and last days of the month', () => {
      const days = getMonthGridDays(REF_DATE);
      const isoStrings = days.map((d) => formatISO(d));
      expect(isoStrings).toContain('2026-02-01');
      expect(isoStrings).toContain('2026-02-28');
    });
  });

  describe('getWeekDays', () => {
    it('returns exactly 7 days', () => {
      expect(getWeekDays(REF_DATE)).toHaveLength(7);
    });

    it('starts on Monday and ends on Sunday', () => {
      const days = getWeekDays(REF_DATE);
      expect(days[0].getDay()).toBe(1);
      expect(days[6].getDay()).toBe(0);
    });
  });

  /* ---- Navigation ---- */

  describe('navigation helpers', () => {
    it('nextMonth advances by one month', () => {
      const result = nextMonth(REF_DATE);
      expect(result.getMonth()).toBe(2); // March
    });

    it('prevMonth goes back one month', () => {
      const result = prevMonth(REF_DATE);
      expect(result.getMonth()).toBe(0); // January
    });

    it('nextWeek advances by 7 days', () => {
      const result = nextWeek(REF_DATE);
      const diffMs = result.getTime() - REF_DATE.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(7);
    });

    it('prevWeek goes back 7 days', () => {
      const result = prevWeek(REF_DATE);
      const diffMs = REF_DATE.getTime() - result.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(7);
    });
  });

  /* ---- Formatting ---- */

  describe('formatting helpers', () => {
    it('formatMonthYear returns "February 2026"', () => {
      expect(formatMonthYear(REF_DATE)).toBe('February 2026');
    });

    it('formatDayNumber returns "28"', () => {
      expect(formatDayNumber(REF_DATE)).toBe('28');
    });

    it('formatISO returns "2026-02-28"', () => {
      expect(formatISO(REF_DATE)).toBe('2026-02-28');
    });

    it('formatTime returns HH:mm', () => {
      const d = new Date(2026, 1, 28, 14, 30);
      expect(formatTime(d)).toBe('14:30');
    });

    it('formatFullDate returns a long human-readable string', () => {
      expect(formatFullDate(REF_DATE)).toContain('February');
      expect(formatFullDate(REF_DATE)).toContain('2026');
    });
  });

  /* ---- Comparisons ---- */

  describe('comparison helpers', () => {
    it('isSameMonthAs returns true for dates in the same month', () => {
      expect(isSameMonthAs(new Date(2026, 1, 1), REF_DATE)).toBe(true);
    });

    it('isSameMonthAs returns false for dates in different months', () => {
      expect(isSameMonthAs(new Date(2026, 2, 1), REF_DATE)).toBe(false);
    });

    it('isSameDayAs detects identical calendar days', () => {
      const a = new Date(2026, 1, 28, 10, 0);
      const b = new Date(2026, 1, 28, 22, 0);
      expect(isSameDayAs(a, b)).toBe(true);
    });

    it('isToday returns true for now', () => {
      expect(isToday(new Date())).toBe(true);
    });
  });

  /* ---- Parsing ---- */

  describe('safeParseISO', () => {
    it('parses a valid ISO date string', () => {
      const result = safeParseISO('2026-02-28');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2026);
    });

    it('returns null for invalid strings', () => {
      expect(safeParseISO('not-a-date')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(safeParseISO('')).toBeNull();
    });
  });

  /* ---- toStartOfDay ---- */

  describe('toStartOfDay', () => {
    it('sets time to midnight', () => {
      const d = new Date(2026, 1, 28, 15, 45, 30);
      const result = toStartOfDay(d);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });
});
