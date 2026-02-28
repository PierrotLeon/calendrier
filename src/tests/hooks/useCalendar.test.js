/**
 * @file useCalendar.test.js
 * @description Unit tests for the useCalendar hook.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalendar } from '../../hooks/useCalendar';
import { VIEW_MODES } from '../../constants';

const REF_DATE = new Date(2026, 1, 15); // February 15, 2026

describe('useCalendar', () => {
  it('initialises with the provided date', () => {
    const { result } = renderHook(() => useCalendar(REF_DATE));
    expect(result.current.currentDate).toEqual(REF_DATE);
  });

  it('defaults to month view', () => {
    const { result } = renderHook(() => useCalendar(REF_DATE));
    expect(result.current.viewMode).toBe(VIEW_MODES.MONTH);
  });

  it('generates a month grid by default', () => {
    const { result } = renderHook(() => useCalendar(REF_DATE));
    // Month grid should have 5 or 6 rows × 7 columns
    expect(result.current.days.length % 7).toBe(0);
    expect(result.current.days.length).toBeGreaterThanOrEqual(28);
  });

  it('generates a week grid when in week view', () => {
    const { result } = renderHook(() => useCalendar(REF_DATE));
    act(() => result.current.setViewMode(VIEW_MODES.WEEK));
    expect(result.current.days).toHaveLength(7);
  });

  it('goNext advances by one month in month view', () => {
    const { result } = renderHook(() => useCalendar(REF_DATE));
    act(() => result.current.goNext());
    expect(result.current.currentDate.getMonth()).toBe(2); // March
  });

  it('goPrev goes back one month in month view', () => {
    const { result } = renderHook(() => useCalendar(REF_DATE));
    act(() => result.current.goPrev());
    expect(result.current.currentDate.getMonth()).toBe(0); // January
  });

  it('goNext advances by one week in week view', () => {
    const { result } = renderHook(() => useCalendar(REF_DATE));
    act(() => result.current.setViewMode(VIEW_MODES.WEEK));
    const before = result.current.currentDate.getTime();
    act(() => result.current.goNext());
    const diff = result.current.currentDate.getTime() - before;
    // Should be ~7 days in milliseconds
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('goToday sets the date to today', () => {
    const { result } = renderHook(() => useCalendar(REF_DATE));
    act(() => result.current.goNext());
    act(() => result.current.goToday());
    const today = new Date();
    expect(result.current.currentDate.getDate()).toBe(today.getDate());
    expect(result.current.currentDate.getMonth()).toBe(today.getMonth());
  });

  it('goToDate sets a specific date', () => {
    const { result } = renderHook(() => useCalendar(REF_DATE));
    const target = new Date(2027, 5, 10);
    act(() => result.current.goToDate(target));
    expect(result.current.currentDate).toEqual(target);
  });
});
