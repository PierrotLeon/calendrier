/**
 * @file setup.js
 * @description Vitest global test setup.
 *
 * - Extends matchers with `@testing-library/jest-dom` (toBeInTheDocument, etc.).
 * - Provides a minimal `localStorage` mock for JSDOM.
 * - Cleans up after each test automatically.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/* Automatically unmount React trees after each test. */
afterEach(() => {
  cleanup();
});

/* ---- localStorage polyfill for JSDOM ---- */
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] ?? null,
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });
