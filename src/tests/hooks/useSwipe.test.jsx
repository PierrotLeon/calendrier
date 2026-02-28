/**
 * @file useSwipe.test.js
 * @description Unit tests for the useSwipe hook.
 *
 * The hook now returns `handlers` (onTouchStart, onTouchMove, onTouchEnd)
 * as React event props.  We test by rendering a real component that
 * spreads those handlers on a div, then dispatch native touch events.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useRef, useState } from 'react';
import { useSwipe } from '../../hooks/useSwipe';

/** Simulate a touchstart event. */
function fireTouchStart(el, clientX, clientY) {
  el.dispatchEvent(
    new TouchEvent('touchstart', {
      bubbles: true,
      touches: [{ clientX, clientY }],
    }),
  );
}

/** Simulate a touchmove event. */
function fireTouchMove(el, clientX, clientY) {
  el.dispatchEvent(
    new TouchEvent('touchmove', {
      bubbles: true,
      touches: [{ clientX, clientY }],
    }),
  );
}

/** Simulate a touchend event. */
function fireTouchEnd(el) {
  el.dispatchEvent(
    new TouchEvent('touchend', {
      bubbles: true,
      changedTouches: [{ clientX: 0, clientY: 0 }],
    }),
  );
}

/**
 * Test harness component — renders a div with swipe handlers
 * and exposes state in data-attributes for assertions.
 */
let lastResult;
function SwipeHarness({ onSwipeLeft, onSwipeRight }) {
  const ref = useRef(null);
  const result = useSwipe(ref, { onSwipeLeft, onSwipeRight });
  lastResult = result;
  const { handlers } = result;

  return (
    <div
      ref={ref}
      data-testid="swipe-target"
      style={{ width: 400, height: 400 }}
      {...handlers}
    />
  );
}

describe('useSwipe', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    lastResult = null;
  });
  afterEach(() => { vi.useRealTimers(); });

  function setup(options = {}) {
    const onSwipeLeft = options.onSwipeLeft ?? vi.fn();
    const onSwipeRight = options.onSwipeRight ?? vi.fn();

    const { unmount, getByTestId } = render(
      <SwipeHarness onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />,
    );

    const el = getByTestId('swipe-target');
    Object.defineProperty(el, 'offsetWidth', { value: 400, configurable: true });

    return { el, onSwipeLeft, onSwipeRight, unmount, getResult: () => lastResult };
  }

  it('returns offsetX tracking the finger during touchmove', () => {
    const { el, getResult } = setup();

    act(() => fireTouchStart(el, 200, 100));
    act(() => fireTouchMove(el, 150, 100)); // dx = -50

    expect(getResult().offsetX).toBe(-50);
    expect(getResult().isSwiping).toBe(true);
    expect(getResult().transition).toBe('');
  });

  it('calls onSwipeLeft after slide-out when swiping left beyond threshold', () => {
    const { el, onSwipeLeft, onSwipeRight } = setup();

    act(() => fireTouchStart(el, 200, 100));
    act(() => fireTouchMove(el, 100, 100)); // dx = -100 (> 60 px = 15% of 400)
    act(() => fireTouchEnd(el));

    // Callback fires after the animation timeout
    expect(onSwipeLeft).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(400); });

    expect(onSwipeLeft).toHaveBeenCalledOnce();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('calls onSwipeRight after slide-out when swiping right beyond threshold', () => {
    const { el, onSwipeLeft, onSwipeRight } = setup();

    act(() => fireTouchStart(el, 100, 100));
    act(() => fireTouchMove(el, 250, 100)); // dx = +150
    act(() => fireTouchEnd(el));

    act(() => { vi.advanceTimersByTime(400); });

    expect(onSwipeRight).toHaveBeenCalledOnce();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('snaps back without calling callbacks when below threshold', () => {
    const { el, onSwipeLeft, onSwipeRight, getResult } = setup();

    act(() => fireTouchStart(el, 100, 100));
    act(() => fireTouchMove(el, 130, 100)); // dx = 30 (< 60 = 15% of 400)
    act(() => fireTouchEnd(el));

    // Should snap back — offsetX returns to 0 with a transition
    expect(getResult().offsetX).toBe(0);
    expect(getResult().transition).toContain('ease-out');

    act(() => { vi.advanceTimersByTime(400); });

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('ignores vertical-dominant gestures', () => {
    const { el, onSwipeLeft, onSwipeRight, getResult } = setup();

    act(() => fireTouchStart(el, 100, 100));
    act(() => fireTouchMove(el, 120, 250)); // dy=150 dominates dx=20

    // Direction locked as vertical — no horizontal offset
    expect(getResult().isSwiping).toBe(false);

    act(() => fireTouchEnd(el));
    act(() => { vi.advanceTimersByTime(400); });

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('resets state after navigation callback fires', () => {
    const { el, getResult } = setup();

    act(() => fireTouchStart(el, 200, 100));
    act(() => fireTouchMove(el, 100, 100));
    act(() => fireTouchEnd(el));

    act(() => { vi.advanceTimersByTime(400); });

    expect(getResult().offsetX).toBe(0);
    expect(getResult().isSwiping).toBe(false);
    expect(getResult().transition).toBe('');
  });

  it('returns handlers object with touch event props', () => {
    const { getResult } = setup();
    const { handlers } = getResult();
    expect(handlers).toHaveProperty('onTouchStart');
    expect(handlers).toHaveProperty('onTouchMove');
    expect(handlers).toHaveProperty('onTouchEnd');
    expect(typeof handlers.onTouchStart).toBe('function');
    expect(typeof handlers.onTouchMove).toBe('function');
    expect(typeof handlers.onTouchEnd).toBe('function');
  });
});
