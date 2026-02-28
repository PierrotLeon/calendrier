/**
 * @module useCalendar
 * @description Manages the calendar's navigation state: current date, view mode,
 * and the derived grid of visible days.
 *
 * This hook owns no event data — it only computes *which* days to display.
 */

import { useState, useMemo, useCallback } from 'react';
import { VIEW_MODES } from '../constants';
import {
  getMonthGridDays,
  getWeekDays,
  nextMonth,
  prevMonth,
  nextWeek,
  prevWeek,
} from '../utils/dateUtils';

/**
 * @param {Date} [initialDate=new Date()] – the date to centre the calendar on.
 * @returns {Object} calendar navigation state and helpers.
 */
export function useCalendar(initialDate = new Date()) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState(VIEW_MODES.MONTH);

  /* ---- Derived grid of visible days ---- */
  const days = useMemo(() => {
    return viewMode === VIEW_MODES.MONTH
      ? getMonthGridDays(currentDate)
      : getWeekDays(currentDate);
  }, [currentDate, viewMode]);

  /** Days for the previous month/week (shown during swipe-right). */
  const prevDays = useMemo(() => {
    const d = viewMode === VIEW_MODES.MONTH ? prevMonth(currentDate) : prevWeek(currentDate);
    return viewMode === VIEW_MODES.MONTH ? getMonthGridDays(d) : getWeekDays(d);
  }, [currentDate, viewMode]);

  /** Days for the next month/week (shown during swipe-left). */
  const nextDays = useMemo(() => {
    const d = viewMode === VIEW_MODES.MONTH ? nextMonth(currentDate) : nextWeek(currentDate);
    return viewMode === VIEW_MODES.MONTH ? getMonthGridDays(d) : getWeekDays(d);
  }, [currentDate, viewMode]);

  /** Date anchor for the previous period (used for "other month" styling). */
  const prevDate = useMemo(() => {
    return viewMode === VIEW_MODES.MONTH ? prevMonth(currentDate) : prevWeek(currentDate);
  }, [currentDate, viewMode]);

  /** Date anchor for the next period. */
  const nextDate = useMemo(() => {
    return viewMode === VIEW_MODES.MONTH ? nextMonth(currentDate) : nextWeek(currentDate);
  }, [currentDate, viewMode]);

  /* ---- Navigation callbacks ---- */
  const goNext = useCallback(() => {
    setCurrentDate((d) =>
      viewMode === VIEW_MODES.MONTH ? nextMonth(d) : nextWeek(d),
    );
  }, [viewMode]);

  const goPrev = useCallback(() => {
    setCurrentDate((d) =>
      viewMode === VIEW_MODES.MONTH ? prevMonth(d) : prevWeek(d),
    );
  }, [viewMode]);

  const goToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToDate = useCallback((date) => {
    setCurrentDate(date);
  }, []);

  return {
    currentDate,
    viewMode,
    setViewMode,
    days,
    prevDays,
    nextDays,
    prevDate,
    nextDate,
    goNext,
    goPrev,
    goToday,
    goToDate,
  };
}
