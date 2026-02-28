/**
 * @module eventModel
 * @description Factory and validation helpers for calendar event objects.
 *
 * Keeping the event "shape" in one place makes it easy to evolve the
 * schema later (e.g., adding recurrence, attendees, or sync metadata)
 * without touching every consumer.
 *
 * Events now support **multi-day spans** via `startDate` and `endDate`.
 * For backward-compatibility the legacy `date` field is still present
 * and always equals `startDate`.
 */

import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_EVENT_COLOR } from '../constants';

/* ------------------------------------------------------------------ */
/*  Factory                                                           */
/* ------------------------------------------------------------------ */

/**
 * Create a new calendar event with sensible defaults.
 *
 * @param {Object}  overrides
 * @param {string}  overrides.title        – event title (required-ish).
 * @param {string}  overrides.startDate    – ISO date string, e.g. "2026-02-28".
 * @param {string}  [overrides.endDate]    – ISO date string; defaults to `startDate` (single-day).
 * @param {string}  [overrides.startTime]  – "HH:mm" (optional).
 * @param {string}  [overrides.endTime]    – "HH:mm" (optional).
 * @param {string}  [overrides.description] – longer description text.
 * @param {string}  [overrides.color]      – hex colour for the event chip.
 * @returns {Object} A fully-formed event object with a unique `id`.
 */
export function createEvent(overrides = {}) {
  const startDate = overrides.startDate || overrides.date || '';
  const endDate = overrides.endDate || startDate;

  return {
    id: uuidv4(),
    title: '',
    startDate,
    endDate,
    date: startDate,   // legacy alias — always mirrors startDate
    startTime: '',     // "HH:mm"
    endTime: '',       // "HH:mm"
    description: '',
    color: DEFAULT_EVENT_COLOR,
    createdAt: new Date().toISOString(),
    ...overrides,
    // Enforce consistency after overrides are applied
    startDate: overrides.startDate || overrides.date || '',
    endDate: overrides.endDate || overrides.startDate || overrides.date || '',
    date: overrides.startDate || overrides.date || '',
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Check whether an event spans multiple days.
 * @param {Object} event
 * @returns {boolean}
 */
export function isMultiDay(event) {
  return Boolean(event.startDate && event.endDate && event.endDate > event.startDate);
}

/**
 * Check whether a given ISO date string falls within the event's date range.
 * Works for both single-day and multi-day events.
 *
 * @param {Object} event   – event with `startDate` and `endDate`.
 * @param {string} dateISO – "yyyy-MM-dd" to test.
 * @returns {boolean}
 */
export function eventCoversDate(event, dateISO) {
  const start = event.startDate || event.date || '';
  const end = event.endDate || start;
  return dateISO >= start && dateISO <= end;
}

/* ------------------------------------------------------------------ */
/*  Validation                                                        */
/* ------------------------------------------------------------------ */

/**
 * Validate an event object and return an array of error messages.
 * An empty array means the event is valid.
 *
 * @param {Object} event
 * @returns {string[]} list of human-readable validation errors.
 */
export function validateEvent(event) {
  const errors = [];

  if (!event.title || event.title.trim().length === 0) {
    errors.push('Le titre est obligatoire.');
  }

  const startDate = event.startDate || event.date || '';
  const endDate = event.endDate || startDate;

  if (!startDate) {
    errors.push('La date de début est obligatoire.');
  }

  if (startDate && endDate && endDate < startDate) {
    errors.push('La date de fin ne peut pas précéder la date de début.');
  }

  // Time validation only makes sense for single-day events
  const sameDay = !endDate || endDate === startDate;
  if (sameDay && event.startTime && event.endTime && event.startTime >= event.endTime) {
    errors.push('L\'heure de fin doit être après l\'heure de début.');
  }

  return errors;
}
