/**
 * @module icsImporter
 * @description Parses RFC 5545 .ics (iCalendar) files into event objects
 * compatible with the Calendrier app.
 *
 * Handles:
 * - All-day events (DTSTART;VALUE=DATE)
 * - Timed events (DTSTART with time component)
 * - Multi-day events
 * - SUMMARY, DESCRIPTION, UID
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545
 */

import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_EVENT_COLOR } from '../constants';

/**
 * Unfold continuation lines (RFC 5545 §3.1): a CRLF followed by a
 * single whitespace character is a line continuation.
 * @param {string} raw
 * @returns {string}
 */
function unfold(raw) {
  return raw.replace(/\r?\n[ \t]/g, '');
}

/**
 * Unescape iCalendar text values.
 * @param {string} text
 * @returns {string}
 */
function unescapeText(text) {
  if (!text) return '';
  return text
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

/**
 * Parse a DTSTART or DTEND value into { date, time }.
 * Supports:
 *   "20260714"           → { date: "2026-07-14", time: null }
 *   "20260714T093000"    → { date: "2026-07-14", time: "09:30" }
 *   "20260714T093000Z"   → { date: "2026-07-14", time: "09:30" }
 *
 * @param {string} value – raw ICS date/datetime string
 * @returns {{ date: string, time: string|null }}
 */
function parseDTValue(value) {
  if (!value) return { date: '', time: null };
  // Strip trailing Z (we ignore timezones for simplicity)
  const clean = value.replace(/Z$/, '');

  if (clean.length === 8) {
    // DATE only: YYYYMMDD
    const date = `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
    return { date, time: null };
  }

  if (clean.length >= 15 && clean.includes('T')) {
    const datePart = clean.slice(0, 8);
    const timePart = clean.slice(9, 13); // HHMM
    const date = `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;
    const time = `${timePart.slice(0, 2)}:${timePart.slice(2, 4)}`;
    return { date, time };
  }

  return { date: '', time: null };
}

/**
 * Parse the full content of an .ics file into an array of app-compatible events.
 *
 * @param {string} icsContent – raw text of the .ics file.
 * @param {Object} [options]
 * @param {string} [options.defaultColor] – colour to assign to imported events.
 * @param {boolean} [options.isHoliday] – mark events as holidays.
 * @returns {Object[]} array of event objects ready for `addEvent`.
 */
export function parseICS(icsContent, options = {}) {
  const { defaultColor = DEFAULT_EVENT_COLOR, isHoliday = false } = options;
  const content = unfold(icsContent);
  const lines = content.split(/\r?\n/);

  const events = [];
  let inEvent = false;
  let current = {};

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === 'BEGIN:VEVENT') {
      inEvent = true;
      current = {};
      continue;
    }

    if (trimmed === 'END:VEVENT') {
      inEvent = false;
      if (current.dtstart) {
        const start = parseDTValue(current.dtstart);
        const end = current.dtend ? parseDTValue(current.dtend) : { ...start };

        // For VALUE=DATE DTEND, the end is exclusive — subtract one day
        if (!start.time && end.date && end.date !== start.date) {
          const d = new Date(end.date + 'T00:00:00');
          d.setDate(d.getDate() - 1);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          end.date = `${yyyy}-${mm}-${dd}`;
        }

        const event = {
          id: uuidv4(),
          title: current.summary || 'Événement importé',
          startDate: start.date,
          endDate: end.date || start.date,
          date: start.date,
          startTime: start.time || '',
          endTime: end.time || '',
          description: current.description || '',
          color: defaultColor,
        };

        if (isHoliday) {
          event.isHoliday = true;
        }

        events.push(event);
      }
      continue;
    }

    if (!inEvent) continue;

    // Parse property:value or property;params:value
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).toUpperCase();
    const value = trimmed.slice(colonIndex + 1);

    // Handle parameters (e.g., DTSTART;VALUE=DATE:20260714)
    const baseProp = key.split(';')[0];

    switch (baseProp) {
      case 'DTSTART':
        current.dtstart = value;
        break;
      case 'DTEND':
        current.dtend = value;
        break;
      case 'SUMMARY':
        current.summary = unescapeText(value);
        break;
      case 'DESCRIPTION':
        current.description = unescapeText(value);
        break;
    }
  }

  return events;
}
