/**
 * @file CalendarGrid.swipe.test.jsx
 * @description Integration tests that verify swiping left/right on the
 * CalendarGrid actually navigates to the correct adjacent month/week.
 *
 * These tests wire CalendarGrid to the real useCalendar hook and simulate
 * full touch gesture sequences (touchstart → touchmove → touchend).
 * After the swipe animation fires, we assert that the displayed days
 * belong to the expected month.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useState } from 'react';
import CalendarGrid from '../../components/CalendarGrid';
import { useCalendar } from '../../hooks/useCalendar';

/* ---- Touch event helpers ---- */

function fireTouchStart(el, clientX, clientY = 100) {
  el.dispatchEvent(
    new TouchEvent('touchstart', {
      bubbles: true,
      touches: [{ clientX, clientY }],
    }),
  );
}

function fireTouchMove(el, clientX, clientY = 100) {
  el.dispatchEvent(
    new TouchEvent('touchmove', {
      bubbles: true,
      touches: [{ clientX, clientY }],
    }),
  );
}

function fireTouchEnd(el) {
  el.dispatchEvent(
    new TouchEvent('touchend', {
      bubbles: true,
      changedTouches: [{ clientX: 0, clientY: 0 }],
    }),
  );
}

/**
 * Wrapper component that wires useCalendar to CalendarGrid.
 * Mirrors how App.jsx connects the two.
 */
function CalendarWithSwipe({ initialDate }) {
  const calendar = useCalendar(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  return (
    <div>
      {/* Expose month label for assertions */}
      <div data-testid="current-month">
        {calendar.currentDate.getFullYear()}-{String(calendar.currentDate.getMonth() + 1).padStart(2, '0')}
      </div>
      <CalendarGrid
        days={calendar.days}
        currentDate={calendar.currentDate}
        selectedDate={selectedDate}
        events={[]}
        onDayClick={setSelectedDate}
        onDayDoubleClick={() => {}}
        onEventClick={() => {}}
        viewMode={calendar.viewMode}
        holidays={new Map()}
        onPrev={calendar.goPrev}
        onNext={calendar.goNext}
        prevDays={calendar.prevDays}
        nextDays={calendar.nextDays}
        prevDate={calendar.prevDate}
        nextDate={calendar.nextDate}
      />
    </div>
  );
}

describe('CalendarGrid swipe navigation', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  /**
   * Helper: perform a full swipe gesture on the grid element.
   * @param {HTMLElement} el - the grid DOM node
   * @param {'left'|'right'} dir - swipe direction
   * @param {number} distance - px to move (must exceed 15% threshold)
   */
  function performSwipe(el, dir, distance = 150) {
    const startX = 200;
    const endX = dir === 'left' ? startX - distance : startX + distance;

    act(() => fireTouchStart(el, startX));
    // First move to lock direction
    act(() => fireTouchMove(el, dir === 'left' ? startX - 20 : startX + 20));
    // Full move
    act(() => fireTouchMove(el, endX));
    act(() => fireTouchEnd(el));

    // Advance timers to let the slide-out animation + callback fire
    act(() => { vi.advanceTimersByTime(500); });
  }

  it('starts on February 2026', () => {
    const feb2026 = new Date(2026, 1, 15); // Feb 15, 2026
    render(<CalendarWithSwipe initialDate={feb2026} />);

    expect(screen.getByTestId('current-month').textContent).toBe('2026-02');
  });

  it('swipe left navigates to the next month (Feb → Mar)', () => {
    const feb2026 = new Date(2026, 1, 15);
    const { container } = render(<CalendarWithSwipe initialDate={feb2026} />);

    // The grid is inside a div with role="grid"
    const grid = screen.getByRole('grid');
    // Give it a realistic width for threshold calculations
    Object.defineProperty(grid, 'offsetWidth', { value: 400, configurable: true });

    expect(screen.getByTestId('current-month').textContent).toBe('2026-02');

    performSwipe(grid, 'left');

    expect(screen.getByTestId('current-month').textContent).toBe('2026-03');
  });

  it('swipe right navigates to the previous month (Feb → Jan)', () => {
    const feb2026 = new Date(2026, 1, 15);
    render(<CalendarWithSwipe initialDate={feb2026} />);

    const grid = screen.getByRole('grid');
    Object.defineProperty(grid, 'offsetWidth', { value: 400, configurable: true });

    expect(screen.getByTestId('current-month').textContent).toBe('2026-02');

    performSwipe(grid, 'right');

    expect(screen.getByTestId('current-month').textContent).toBe('2026-01');
  });

  it('swipe left twice: Feb → Mar → Apr', () => {
    const feb2026 = new Date(2026, 1, 15);
    render(<CalendarWithSwipe initialDate={feb2026} />);

    const grid = screen.getByRole('grid');
    Object.defineProperty(grid, 'offsetWidth', { value: 400, configurable: true });

    performSwipe(grid, 'left');
    expect(screen.getByTestId('current-month').textContent).toBe('2026-03');

    performSwipe(grid, 'left');
    expect(screen.getByTestId('current-month').textContent).toBe('2026-04');
  });

  it('swipe right twice: Feb → Jan → Dec 2025', () => {
    const feb2026 = new Date(2026, 1, 15);
    render(<CalendarWithSwipe initialDate={feb2026} />);

    const grid = screen.getByRole('grid');
    Object.defineProperty(grid, 'offsetWidth', { value: 400, configurable: true });

    performSwipe(grid, 'right');
    expect(screen.getByTestId('current-month').textContent).toBe('2026-01');

    performSwipe(grid, 'right');
    expect(screen.getByTestId('current-month').textContent).toBe('2025-12');
  });

  it('swipe left then right returns to original month', () => {
    const feb2026 = new Date(2026, 1, 15);
    render(<CalendarWithSwipe initialDate={feb2026} />);

    const grid = screen.getByRole('grid');
    Object.defineProperty(grid, 'offsetWidth', { value: 400, configurable: true });

    performSwipe(grid, 'left');
    expect(screen.getByTestId('current-month').textContent).toBe('2026-03');

    performSwipe(grid, 'right');
    expect(screen.getByTestId('current-month').textContent).toBe('2026-02');
  });

  it('short swipe below threshold does NOT change month', () => {
    const feb2026 = new Date(2026, 1, 15);
    render(<CalendarWithSwipe initialDate={feb2026} />);

    const grid = screen.getByRole('grid');
    Object.defineProperty(grid, 'offsetWidth', { value: 400, configurable: true });

    // Small swipe: 30px < threshold (60px = 15% of 400)
    performSwipe(grid, 'left', 30);

    expect(screen.getByTestId('current-month').textContent).toBe('2026-02');
  });

  it('after swipe left, the grid contains days from March', () => {
    const feb2026 = new Date(2026, 1, 15);
    render(<CalendarWithSwipe initialDate={feb2026} />);

    const grid = screen.getByRole('grid');
    Object.defineProperty(grid, 'offsetWidth', { value: 400, configurable: true });

    performSwipe(grid, 'left');

    // March 2026 starts on a Sunday. The month grid should contain March 1st.
    // Day cells show numbers; we check that "1" appears for March 1.
    // Also check that a March-specific day like "15" or "31" is present.
    const dayCells = grid.querySelectorAll('.day-cell');
    expect(dayCells.length).toBeGreaterThan(0);

    // The grid should have days that include March dates
    const dayNumbers = Array.from(dayCells).map((c) =>
      c.querySelector('.day-cell__number')?.textContent,
    );
    // March has 31 days, so "31" should appear
    expect(dayNumbers).toContain('31');
  });

  it('during swipe left, both current and next month pages are visible in the DOM', () => {
    const feb2026 = new Date(2026, 1, 15);
    render(<CalendarWithSwipe initialDate={feb2026} />);

    const grid = screen.getByRole('grid');
    Object.defineProperty(grid, 'offsetWidth', { value: 400, configurable: true });

    // Start the swipe but don't let the animation complete
    act(() => fireTouchStart(grid, 200));
    act(() => fireTouchMove(grid, 180)); // lock direction
    act(() => fireTouchMove(grid, 100)); // significant left swipe

    // During the swipe: check that two calendar grids (pages) are rendered
    const calendarGrids = grid.querySelectorAll('.calendar-grid');
    expect(calendarGrids.length).toBe(2);

    // Check that a swipe-track exists (always present)
    const track = grid.querySelector('.swipe-track');
    expect(track).not.toBeNull();

    // During swipe, the track should NOT have the idle class
    expect(track.classList.contains('swipe-track--idle')).toBe(false);

    // Check that the track has a transform style
    expect(track.style.transform).toContain('translateX');

    // Clean up: finish the swipe
    act(() => fireTouchEnd(grid));
    act(() => { vi.advanceTimersByTime(500); });
  });

  it('during swipe right, prev and current pages are both rendered', () => {
    const feb2026 = new Date(2026, 1, 15);
    render(<CalendarWithSwipe initialDate={feb2026} />);

    const grid = screen.getByRole('grid');
    Object.defineProperty(grid, 'offsetWidth', { value: 400, configurable: true });

    act(() => fireTouchStart(grid, 100));
    act(() => fireTouchMove(grid, 120)); // lock direction
    act(() => fireTouchMove(grid, 250)); // significant right swipe

    const calendarGrids = grid.querySelectorAll('.calendar-grid');
    expect(calendarGrids.length).toBe(2);

    const track = grid.querySelector('.swipe-track');
    expect(track).not.toBeNull();
    // For swipe right, baseOffset is -50%, so transform should contain that
    expect(track.style.transform).toContain('-50%');

    act(() => fireTouchEnd(grid));
    act(() => { vi.advanceTimersByTime(500); });
  });

  it('swipe-track transform includes pixel offset from finger during drag', () => {
    const feb2026 = new Date(2026, 1, 15);
    render(<CalendarWithSwipe initialDate={feb2026} />);

    const grid = screen.getByRole('grid');
    Object.defineProperty(grid, 'offsetWidth', { value: 400, configurable: true });

    act(() => fireTouchStart(grid, 200));
    act(() => fireTouchMove(grid, 180)); // lock direction
    act(() => fireTouchMove(grid, 120)); // dx = -80

    const track = grid.querySelector('.swipe-track');
    expect(track).not.toBeNull();
    // offset should be -80px
    expect(track.style.transform).toContain('-80px');

    act(() => fireTouchEnd(grid));
    act(() => { vi.advanceTimersByTime(500); });
  });

  it('swipe-track is always present (stable DOM for touch events)', () => {
    const feb2026 = new Date(2026, 1, 15);
    render(<CalendarWithSwipe initialDate={feb2026} />);

    const grid = screen.getByRole('grid');
    Object.defineProperty(grid, 'offsetWidth', { value: 400, configurable: true });

    // Before any touch — track is present with idle class
    const trackBefore = grid.querySelector('.swipe-track');
    expect(trackBefore).not.toBeNull();
    expect(trackBefore.classList.contains('swipe-track--idle')).toBe(true);

    // Only one calendar grid when idle
    expect(grid.querySelectorAll('.calendar-grid').length).toBe(1);

    // Start touch
    act(() => fireTouchStart(grid, 200));

    // Track is still the same element (not re-created)
    const trackDuringStart = grid.querySelector('.swipe-track');
    expect(trackDuringStart).toBe(trackBefore);

    // During swipe
    act(() => fireTouchMove(grid, 180));
    act(() => fireTouchMove(grid, 100));

    // Track is still the same element
    const trackDuringMove = grid.querySelector('.swipe-track');
    expect(trackDuringMove).toBe(trackBefore);

    // Now has two calendar grids (adjacent page added)
    expect(grid.querySelectorAll('.calendar-grid').length).toBe(2);

    // No longer idle
    expect(trackDuringMove.classList.contains('swipe-track--idle')).toBe(false);

    // Finish swipe
    act(() => fireTouchEnd(grid));
    act(() => { vi.advanceTimersByTime(500); });

    // After swipe completes, back to idle with one page
    const trackAfter = grid.querySelector('.swipe-track');
    expect(trackAfter).not.toBeNull();
    expect(trackAfter.classList.contains('swipe-track--idle')).toBe(true);
    expect(grid.querySelectorAll('.calendar-grid').length).toBe(1);
  });
});
