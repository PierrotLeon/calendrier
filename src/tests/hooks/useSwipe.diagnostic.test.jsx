/**
 * @file useSwipe.diagnostic.test.jsx
 * @description Diagnostic tests to identify why swipe doesn't work on real phones.
 *
 * Tests both:
 * 1. Direct handler invocation with crafted event objects
 * 2. fireEvent from testing-library (React event system)
 *
 * If strategy 1 passes but strategy 2 fails, the problem is in how
 * React delivers touch events to our handlers.
 * If both pass, the problem is likely CSS or layout related on real devices.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { useRef } from 'react';
import { useSwipe } from '../../hooks/useSwipe';

/* ---- Test harness ---- */

let lastResult;
let handlerCallLog = [];

function SwipeHarness({ onSwipeLeft, onSwipeRight }) {
  const ref = useRef(null);
  const result = useSwipe(ref, { onSwipeLeft, onSwipeRight });
  lastResult = result;

  // Wrap handlers to log calls
  const wrappedHandlers = {
    onTouchStart: (e) => {
      handlerCallLog.push({
        type: 'touchStart',
        hasTouches: !!e.touches,
        touchesLength: e.touches?.length,
        hasClientX: typeof e.touches?.[0]?.clientX === 'number',
        clientX: e.touches?.[0]?.clientX,
      });
      result.handlers.onTouchStart(e);
    },
    onTouchMove: (e) => {
      handlerCallLog.push({
        type: 'touchMove',
        hasTouches: !!e.touches,
        touchesLength: e.touches?.length,
        hasClientX: typeof e.touches?.[0]?.clientX === 'number',
        clientX: e.touches?.[0]?.clientX,
      });
      result.handlers.onTouchMove(e);
    },
    onTouchEnd: (e) => {
      handlerCallLog.push({
        type: 'touchEnd',
        hasTouches: !!e.touches,
        touchesLength: e.touches?.length,
      });
      result.handlers.onTouchEnd(e);
    },
  };

  return (
    <div
      ref={ref}
      data-testid="swipe-target"
      style={{ width: 400, height: 400 }}
      {...wrappedHandlers}
    />
  );
}

describe('useSwipe diagnostics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    lastResult = null;
    handlerCallLog = [];
  });
  afterEach(() => { vi.useRealTimers(); });

  function setup(options = {}) {
    const onSwipeLeft = options.onSwipeLeft ?? vi.fn();
    const onSwipeRight = options.onSwipeRight ?? vi.fn();

    const utils = render(
      <SwipeHarness onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />,
    );

    const el = utils.getByTestId('swipe-target');
    Object.defineProperty(el, 'offsetWidth', { value: 400, configurable: true });

    return { el, onSwipeLeft, onSwipeRight, ...utils };
  }

  /* ============================================================== */
  /*  DIAGNOSTIC 1: Does fireEvent actually reach our React handler? */
  /* ============================================================== */

  it('fireEvent.touchStart triggers the React onTouchStart handler', () => {
    const { el } = setup();

    act(() => {
      fireEvent.touchStart(el, { touches: [{ clientX: 200, clientY: 100 }] });
    });

    expect(handlerCallLog.length).toBeGreaterThanOrEqual(1);
    const log = handlerCallLog.find(l => l.type === 'touchStart');
    expect(log).toBeDefined();
  });

  it('fireEvent.touchMove triggers the React onTouchMove handler', () => {
    const { el } = setup();

    act(() => {
      fireEvent.touchStart(el, { touches: [{ clientX: 200, clientY: 100 }] });
    });
    act(() => {
      fireEvent.touchMove(el, { touches: [{ clientX: 150, clientY: 100 }] });
    });

    const log = handlerCallLog.find(l => l.type === 'touchMove');
    expect(log).toBeDefined();
  });

  it('fireEvent.touchEnd triggers the React onTouchEnd handler', () => {
    const { el } = setup();

    act(() => {
      fireEvent.touchStart(el, { touches: [{ clientX: 200, clientY: 100 }] });
    });
    act(() => {
      fireEvent.touchMove(el, { touches: [{ clientX: 100, clientY: 100 }] });
    });
    act(() => {
      fireEvent.touchEnd(el);
    });

    const log = handlerCallLog.find(l => l.type === 'touchEnd');
    expect(log).toBeDefined();
  });

  /* ============================================================== */
  /*  DIAGNOSTIC 2: Does e.touches[0].clientX work with fireEvent?  */
  /* ============================================================== */

  it('fireEvent.touchStart provides e.touches[0].clientX correctly', () => {
    const { el } = setup();

    act(() => {
      fireEvent.touchStart(el, { touches: [{ clientX: 200, clientY: 100 }] });
    });

    const log = handlerCallLog.find(l => l.type === 'touchStart');
    expect(log.hasTouches).toBe(true);
    expect(log.touchesLength).toBe(1);
    expect(log.hasClientX).toBe(true);
    expect(log.clientX).toBe(200);
  });

  it('fireEvent.touchMove provides e.touches[0].clientX correctly', () => {
    const { el } = setup();

    act(() => {
      fireEvent.touchStart(el, { touches: [{ clientX: 200, clientY: 100 }] });
    });
    act(() => {
      fireEvent.touchMove(el, { touches: [{ clientX: 150, clientY: 100 }] });
    });

    const log = handlerCallLog.find(l => l.type === 'touchMove');
    expect(log.hasTouches).toBe(true);
    expect(log.touchesLength).toBe(1);
    expect(log.hasClientX).toBe(true);
    expect(log.clientX).toBe(150);
  });

  /* ============================================================== */
  /*  DIAGNOSTIC 3: Full swipe via fireEvent — does it work?         */
  /* ============================================================== */

  it('full swipe left via fireEvent triggers onSwipeLeft callback', () => {
    const { el, onSwipeLeft } = setup();

    act(() => {
      fireEvent.touchStart(el, { touches: [{ clientX: 300, clientY: 100 }] });
    });
    act(() => {
      fireEvent.touchMove(el, { touches: [{ clientX: 280, clientY: 100 }] }); // lock horizontal
    });
    act(() => {
      fireEvent.touchMove(el, { touches: [{ clientX: 100, clientY: 100 }] }); // full drag
    });

    expect(lastResult.isSwiping).toBe(true);
    expect(lastResult.direction).toBe('left');
    expect(lastResult.offsetX).toBe(-200);

    act(() => {
      fireEvent.touchEnd(el);
    });

    act(() => { vi.advanceTimersByTime(500); });

    expect(onSwipeLeft).toHaveBeenCalledOnce();
  });

  it('full swipe right via fireEvent triggers onSwipeRight callback', () => {
    const { el, onSwipeRight } = setup();

    act(() => {
      fireEvent.touchStart(el, { touches: [{ clientX: 100, clientY: 100 }] });
    });
    act(() => {
      fireEvent.touchMove(el, { touches: [{ clientX: 120, clientY: 100 }] }); // lock horizontal
    });
    act(() => {
      fireEvent.touchMove(el, { touches: [{ clientX: 300, clientY: 100 }] }); // full drag
    });

    expect(lastResult.isSwiping).toBe(true);
    expect(lastResult.direction).toBe('right');

    act(() => {
      fireEvent.touchEnd(el);
    });

    act(() => { vi.advanceTimersByTime(500); });

    expect(onSwipeRight).toHaveBeenCalledOnce();
  });

  /* ============================================================== */
  /*  DIAGNOSTIC 4: Direct handler call (bypass event system)        */
  /* ============================================================== */

  it('direct handler call: onTouchStart + onTouchMove updates state', () => {
    setup();
    const { handlers } = lastResult;

    act(() => {
      handlers.onTouchStart({ touches: [{ clientX: 200, clientY: 100 }] });
    });
    act(() => {
      handlers.onTouchMove({ touches: [{ clientX: 100, clientY: 100 }] });
    });

    expect(lastResult.isSwiping).toBe(true);
    expect(lastResult.offsetX).toBe(-100);
    expect(lastResult.direction).toBe('left');
  });

  it('direct handler call: full swipe left triggers callback', () => {
    const { onSwipeLeft } = setup();
    const { handlers } = lastResult;

    act(() => {
      handlers.onTouchStart({ touches: [{ clientX: 300, clientY: 100 }] });
    });
    act(() => {
      handlers.onTouchMove({ touches: [{ clientX: 100, clientY: 100 }] });
    });
    act(() => {
      handlers.onTouchEnd();
    });

    act(() => { vi.advanceTimersByTime(500); });

    expect(onSwipeLeft).toHaveBeenCalledOnce();
  });

  /* ============================================================== */
  /*  DIAGNOSTIC 5: dispatchEvent (what current tests use)           */
  /* ============================================================== */

  it('native dispatchEvent touchstart reaches the React handler', () => {
    const { el } = setup();

    act(() => {
      el.dispatchEvent(
        new TouchEvent('touchstart', {
          bubbles: true,
          touches: [{ clientX: 200, clientY: 100 }],
        }),
      );
    });

    const log = handlerCallLog.find(l => l.type === 'touchStart');
    // This might be undefined if native dispatchEvent doesn't reach React handlers!
    if (!log) {
      console.warn('⚠️  Native dispatchEvent(new TouchEvent) did NOT trigger the React onTouchStart handler!');
    }
    expect(log).toBeDefined();
  });

  it('native dispatchEvent provides e.touches[0].clientX correctly', () => {
    const { el } = setup();

    act(() => {
      el.dispatchEvent(
        new TouchEvent('touchstart', {
          bubbles: true,
          touches: [{ clientX: 200, clientY: 100 }],
        }),
      );
    });

    const log = handlerCallLog.find(l => l.type === 'touchStart');
    expect(log).toBeDefined();
    expect(log.hasTouches).toBe(true);
    expect(log.touchesLength).toBe(1);
    expect(log.hasClientX).toBe(true);
    expect(log.clientX).toBe(200);
  });
});
