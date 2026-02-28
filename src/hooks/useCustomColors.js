/**
 * @module useCustomColors
 * @description Manages user-defined custom colours for the event palette.
 *
 * Custom colours are persisted in localStorage alongside the built-in
 * EVENT_COLORS. Components receive the merged palette via `allColors`.
 */

import { useState, useCallback, useEffect } from 'react';
import { EVENT_COLORS, CUSTOM_COLORS_KEY } from '../constants';

function loadCustomColors() {
  try {
    const raw = localStorage.getItem(CUSTOM_COLORS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomColors(colors) {
  try {
    localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(colors));
  } catch (err) {
    console.error('[useCustomColors] Failed to save:', err);
  }
}

/**
 * @returns {Object} customColors state, allColors (merged), and CRUD helpers.
 */
export function useCustomColors() {
  const [customColors, setCustomColors] = useState(() => loadCustomColors());

  useEffect(() => {
    saveCustomColors(customColors);
  }, [customColors]);

  /** Merged palette: built-in + custom. */
  const allColors = [...EVENT_COLORS, ...customColors];

  /** Add a new custom colour. */
  const addColor = useCallback((hex) => {
    // Avoid duplicates
    const normalised = hex.toUpperCase();
    setCustomColors((prev) => {
      const existing = [...EVENT_COLORS, ...prev].map((c) =>
        (typeof c === 'string' ? c : c.value).toUpperCase()
      );
      if (existing.includes(normalised)) return prev;
      return [...prev, { label: hex, value: hex }];
    });
  }, []);

  /** Remove a custom colour by value. */
  const removeColor = useCallback((hex) => {
    setCustomColors((prev) => prev.filter((c) => c.value !== hex));
  }, []);

  return { customColors, allColors, addColor, removeColor };
}
