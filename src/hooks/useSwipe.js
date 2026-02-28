/**
 * @module useSwipe
 * @description Detects horizontal swipe gestures and provides real-time
 * tracking so the UI can follow the finger.
 *
 * Returns an object with:
 * - `offsetX`    – current horizontal displacement in px (0 when idle).
 * - `isSwiping`  – true while a horizontal gesture is in progress.
 * - `transition` – CSS transition string (empty while dragging, set on release).
 * - `direction`  – 'left' | 'right' | null.
 * - `handlers`   – `{ onTouchStart, onTouchMove, onTouchEnd }` props to
 *                  spread on the swipeable element.
 *
 * Usage:
 * ```jsx
 * const { offsetX, handlers } = useSwipe(ref, { onSwipeLeft, onSwipeRight });
 * return <div ref={ref} {...handlers}>…</div>;
 * ```
 *
 * The `ref` is still needed so handleTouchEnd can read `offsetWidth` for
 * the threshold calculation — but listeners are attached via React props,
 * not via addEventListener, eliminating ref-timing / StrictMode issues.
 */

import { useState, useRef, useCallback } from 'react';

const MIN_THRESHOLD_PX = 50;
const THRESHOLD_RATIO = 0.15;   // 15 % of container width
const MAX_ANIM_MS = 300;        // cap for slow swipes
const MIN_ANIM_MS = 120;        // floor for very fast flicks

/**
 * @param {React.RefObject} ref – ref attached to the swipeable element
 *        (used only for reading offsetWidth on touchend).
 * @param {Object} opts
 * @param {Function} opts.onSwipeLeft  – called after the slide-out animation (→ next).
 * @param {Function} opts.onSwipeRight – called after the slide-out animation (→ prev).
 */
export function useSwipe(ref, { onSwipeLeft, onSwipeRight } = {}) {
  const [swipeState, setSwipeState] = useState({
    offsetX: 0,
    isSwiping: false,
    transition: '',
    direction: null, // 'left' | 'right' | null
  });

  // Mutable tracking refs (no re-renders during drag)
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const locked = useRef(false);    // true once direction is decided
  const horizontal = useRef(false); // true if gesture is horizontal
  const startTime = useRef(0);
  // Store callbacks in refs so the handlers are stable
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);
  onSwipeLeftRef.current = onSwipeLeft;
  onSwipeRightRef.current = onSwipeRight;

  /* ---- handlers (stable — no deps that change) ---- */

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
    currentX.current = t.clientX;
    startTime.current = Date.now();
    locked.current = false;
    horizontal.current = false;
    setSwipeState({ offsetX: 0, isSwiping: false, transition: '', direction: null });
  }, []);

  const onTouchMove = useCallback((e) => {
    const t = e.touches[0];
    const dx = t.clientX - startX.current;
    const dy = t.clientY - startY.current;

    // Lock direction on first significant movement
    if (!locked.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      locked.current = true;
      horizontal.current = Math.abs(dx) >= Math.abs(dy);
    }

    if (!horizontal.current) return; // let vertical scroll happen

    currentX.current = t.clientX;
    const dir = dx < 0 ? 'left' : 'right';
    setSwipeState({ offsetX: dx, isSwiping: true, transition: '', direction: dir });
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!horizontal.current) {
      setSwipeState({ offsetX: 0, isSwiping: false, transition: '', direction: null });
      return;
    }

    const el = ref.current;
    const width = el ? el.offsetWidth : 400;
    const dx = currentX.current - startX.current;
    const absDx = Math.abs(dx);
    const threshold = Math.max(MIN_THRESHOLD_PX, width * THRESHOLD_RATIO);

    if (absDx < threshold) {
      // Snap back
      setSwipeState({ offsetX: 0, isSwiping: false, transition: 'transform 200ms ease-out', direction: null });
      return;
    }

    // Compute velocity-based animation duration for the remaining distance
    const elapsed = Date.now() - startTime.current || 1;
    const velocity = absDx / elapsed; // px/ms
    const remaining = width - absDx;
    const duration = Math.min(MAX_ANIM_MS, Math.max(MIN_ANIM_MS, remaining / velocity));

    // Slide fully off-screen in the swipe direction
    const targetX = dx < 0 ? -width : width;
    const transitionStr = `transform ${Math.round(duration)}ms ease-out`;
    const dir = dx < 0 ? 'left' : 'right';

    setSwipeState({ offsetX: targetX, isSwiping: true, transition: transitionStr, direction: dir });

    // After the animation, fire the callback then reset.
    // Order matters: calling cb() first updates the parent's state so that
    // when we reset isSwiping the component renders the *new* month,
    // avoiding a single-frame flash of the old month.
    const cb = dx < 0 ? onSwipeLeftRef.current : onSwipeRightRef.current;
    setTimeout(() => {
      cb?.();
      setSwipeState({ offsetX: 0, isSwiping: false, transition: '', direction: null });
    }, Math.round(duration));
  }, [ref]);

  return {
    ...swipeState,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
