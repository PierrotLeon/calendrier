/**
 * @module eventModel
 * @description Factory and validation helpers for calendar event objects.
 *
 * Keeping the event "shape" in one place makes it easy to evolve the
 * schema later (e.g., adding recurrence, attendees, or sync metadata)
 * without touching every consumer.
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
 * @param {string}  overrides.title      – event title (required-ish).
 * @param {string}  overrides.date       – ISO date string, e.g. "2026-02-28".
 * @param {string}  [overrides.startTime]  – "HH:mm" (optional).
 * @param {string}  [overrides.endTime]    – "HH:mm" (optional).
 * @param {string}  [overrides.description] – longer description text.
 * @param {string}  [overrides.color]    – hex colour for the event chip.
 * @returns {Object} A fully-formed event object with a unique `id`.
 */
export function createEvent(overrides = {}) {
  return {
    id: uuidv4(),
    title: '',
    date: '',          // "yyyy-MM-dd"
    startTime: '',     // "HH:mm"
    endTime: '',       // "HH:mm"
    description: '',
    color: DEFAULT_EVENT_COLOR,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
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
    errors.push('Title is required.');
  }

  if (!event.date) {
    errors.push('Date is required.');
  }

  if (event.startTime && event.endTime && event.startTime >= event.endTime) {
    errors.push('End time must be after start time.');
  }

  return errors;
}
