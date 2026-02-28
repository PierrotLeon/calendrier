/**
 * @module storageService
 * @description Thin abstraction over `localStorage` for persisting calendar events
 * and settings (event-type rules).
 *
 * By isolating storage access behind this module we can:
 * 1. Swap to IndexedDB / a remote API later without touching component code.
 * 2. Provide a mock implementation in tests without monkey-patching globals.
 */

import { STORAGE_KEY, SETTINGS_KEY } from '../constants';

/* ================================================================== */
/*  Events                                                             */
/* ================================================================== */

/**
 * Load all persisted events from storage.
 *
 * @returns {Object[]} array of event objects (may be empty).
 */
export function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('[storageService] Failed to load events:', error);
    return [];
  }
}

/**
 * Persist the full array of events to storage, replacing whatever was
 * stored previously.
 *
 * @param {Object[]} events – the complete event list.
 */
export function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('[storageService] Failed to save events:', error);
  }
}

/**
 * Remove all stored events (useful for testing or a "reset" feature).
 */
export function clearEvents() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[storageService] Failed to clear events:', error);
  }
}

/* ================================================================== */
/*  Settings (Event-type rules)                                        */
/* ================================================================== */

/**
 * Load persisted event-type rules from storage.
 *
 * @returns {Object[]|null} array of rule objects, or `null` if nothing stored
 *                          (so the caller can fall back to defaults).
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('[storageService] Failed to load settings:', error);
    return null;
  }
}

/**
 * Persist event-type rules to storage.
 *
 * @param {Object[]} rules – the complete rule list.
 */
export function saveSettings(rules) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(rules));
  } catch (error) {
    console.error('[storageService] Failed to save settings:', error);
  }
}

/**
 * Remove all stored settings.
 */
export function clearSettings() {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('[storageService] Failed to clear settings:', error);
  }
}
