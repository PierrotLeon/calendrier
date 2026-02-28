/**
 * @module useEvents
 * @description CRUD operations for calendar events with automatic persistence.
 *
 * State is initialised from `localStorage` via the storage service and written
 * back on every mutation. Consumers get a simple imperative API:
 * `addEvent`, `updateEvent`, `deleteEvent`, and a read-only `events` array.
 */

import { useState, useCallback, useEffect } from 'react';
import { loadEvents, saveEvents } from '../services/storageService';
import { createEvent } from '../utils/eventModel';

/**
 * @returns {Object} event state and CRUD helpers.
 */
export function useEvents() {
  const [events, setEvents] = useState(() => loadEvents());

  /* Persist to localStorage whenever events change. */
  useEffect(() => {
    saveEvents(events);
  }, [events]);

  /* ---- CRUD callbacks ---- */

  /**
   * Add a brand-new event.
   * @param {Object} eventData – partial event fields (title, date, etc.).
   * @returns {Object} the fully-formed event that was added.
   */
  const addEvent = useCallback((eventData) => {
    const newEvent = createEvent(eventData);
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  }, []);

  /**
   * Update an existing event by `id`.
   * Only the provided fields are merged; the rest stay unchanged.
   *
   * @param {string} id – event id.
   * @param {Object} updates – fields to overwrite.
   */
  const updateEvent = useCallback((id, updates) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...updates } : ev)),
    );
  }, []);

  /**
   * Remove an event by `id`.
   * @param {string} id
   */
  const deleteEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  }, []);

  /**
   * Return events whose `date` field matches the given ISO string.
   * @param {string} dateISO – "yyyy-MM-dd".
   * @returns {Object[]}
   */
  const getEventsForDate = useCallback(
    (dateISO) => events.filter((ev) => ev.date === dateISO),
    [events],
  );

  return { events, addEvent, updateEvent, deleteEvent, getEventsForDate };
}
