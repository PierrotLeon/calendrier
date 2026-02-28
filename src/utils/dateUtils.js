/**
 * @module dateUtils
 * @description Pure utility functions for date manipulation.
 *
 * All functions are side-effect-free and operate on native `Date` objects.
 * They lean on `date-fns` for heavy lifting but expose a thin, domain-specific
 * API so the rest of the app never imports `date-fns` directly.
 */

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  format,
  isSameMonth,
  isSameDay,
  isToday as dfIsToday,
  parseISO,
  startOfDay,
} from 'date-fns';

/* ------------------------------------------------------------------ */
/*  Week-start option (Monday = 1)                                    */
/* ------------------------------------------------------------------ */

/** Common option object so every week calculation starts on Monday. */
const WEEK_OPTIONS = { weekStartsOn: 1 };

/* ------------------------------------------------------------------ */
/*  Month grid helpers                                                */
/* ------------------------------------------------------------------ */

/**
 * Return an array of `Date` objects representing every cell in a
 * month-view grid (including leading/trailing days from adjacent months).
 *
 * @param {Date} date – any date within the target month.
 * @returns {Date[]} 35 or 42 day objects covering the visible grid.
 */
export function getMonthGridDays(date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, WEEK_OPTIONS);
  const gridEnd = endOfWeek(monthEnd, WEEK_OPTIONS);
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

/* ------------------------------------------------------------------ */
/*  Week grid helpers                                                 */
/* ------------------------------------------------------------------ */

/**
 * Return the 7 days of the week that contains `date`.
 *
 * @param {Date} date – any date within the target week.
 * @returns {Date[]} exactly 7 day objects (Mon → Sun).
 */
export function getWeekDays(date) {
  const weekStart = startOfWeek(date, WEEK_OPTIONS);
  const weekEnd = endOfWeek(date, WEEK_OPTIONS);
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

/* ------------------------------------------------------------------ */
/*  Navigation                                                        */
/* ------------------------------------------------------------------ */

/** Move forward one month.  @returns {Date} */
export function nextMonth(date) {
  return addMonths(date, 1);
}

/** Move backward one month. @returns {Date} */
export function prevMonth(date) {
  return subMonths(date, 1);
}

/** Move forward one week.   @returns {Date} */
export function nextWeek(date) {
  return addWeeks(date, 1);
}

/** Move backward one week.  @returns {Date} */
export function prevWeek(date) {
  return subWeeks(date, 1);
}

/* ------------------------------------------------------------------ */
/*  Formatting                                                        */
/* ------------------------------------------------------------------ */

/**
 * Format a date for display in the calendar header.
 * Example output: "February 2026".
 */
export function formatMonthYear(date) {
  return format(date, 'MMMM yyyy');
}

/**
 * Format as a short day number ("1", "14", "28").
 */
export function formatDayNumber(date) {
  return format(date, 'd');
}

/**
 * Format a date for use as an HTML `<time>` datetime attribute
 * or as a storage key. Example: "2026-02-28".
 */
export function formatISO(date) {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format a time value for display. Example: "14:30".
 */
export function formatTime(date) {
  return format(date, 'HH:mm');
}

/**
 * Human-friendly full date. Example: "Saturday, February 28, 2026".
 */
export function formatFullDate(date) {
  return format(date, 'EEEE, MMMM d, yyyy');
}

/* ------------------------------------------------------------------ */
/*  Comparisons                                                       */
/* ------------------------------------------------------------------ */

/** Check whether `day` falls inside the same calendar month as `referenceDate`. */
export function isSameMonthAs(day, referenceDate) {
  return isSameMonth(day, referenceDate);
}

/** Check whether two dates represent the same calendar day. */
export function isSameDayAs(a, b) {
  return isSameDay(a, b);
}

/** Check whether `date` is today. */
export function isToday(date) {
  return dfIsToday(date);
}

/* ------------------------------------------------------------------ */
/*  Parsing                                                           */
/* ------------------------------------------------------------------ */

/**
 * Safely parse an ISO-8601 date string into a `Date`.
 * Returns `null` for invalid input instead of throwing.
 */
export function safeParseISO(isoString) {
  try {
    const d = parseISO(isoString);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/**
 * Normalise any date to midnight (start of day) so comparisons
 * don't get tripped up by time components.
 */
export function toStartOfDay(date) {
  return startOfDay(date);
}
