/**
 * @module icsExporter
 * @description Generates RFC 5545 compliant .ics (iCalendar) files from
 * calendar events.
 *
 * Supports single-day and multi-day events, with optional start/end times.
 * All-day events use `DTSTART;VALUE=DATE` / `DTEND;VALUE=DATE` properties.
 * Timed events use `DTSTART` / `DTEND` with local time (no VTIMEZONE for
 * simplicity — consumers can layer that on later).
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545
 */

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Fold a long line at 75 octets, as required by RFC 5545 §3.1.
 * @param {string} line
 * @returns {string}
 */
function foldLine(line) {
  const MAX = 75;
  if (line.length <= MAX) return line;
  const parts = [];
  parts.push(line.slice(0, MAX));
  let pos = MAX;
  while (pos < line.length) {
    parts.push(' ' + line.slice(pos, pos + MAX - 1));
    pos += MAX - 1;
  }
  return parts.join('\r\n');
}

/**
 * Escape special characters in iCalendar text values (RFC 5545 §3.3.11).
 * @param {string} text
 * @returns {string}
 */
function escapeText(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Format a date string "yyyy-MM-dd" as ICS date "YYYYMMDD".
 * @param {string} dateISO – "2025-07-14"
 * @returns {string}       – "20250714"
 */
function toICSDate(dateISO) {
  return dateISO.replace(/-/g, '');
}

/**
 * Format a date + time as ICS local datetime "YYYYMMDDTHHMMSS".
 * @param {string} dateISO – "2025-07-14"
 * @param {string} time    – "09:30"
 * @returns {string}       – "20250714T093000"
 */
function toICSDateTime(dateISO, time) {
  return toICSDate(dateISO) + 'T' + time.replace(/:/g, '') + '00';
}

/**
 * Add one day to an ICS date string. Needed because DTEND for VALUE=DATE
 * is *exclusive* in iCalendar (the end date is the day *after* the last day).
 * @param {string} dateISO – "2025-07-14"
 * @returns {string}       – "2025-07-15" in ISO, converted to "20250715"
 */
function nextDayICS(dateISO) {
  const d = new Date(dateISO + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/**
 * Generate a simple UID for the VEVENT.
 * @param {Object} event
 * @returns {string}
 */
function makeUID(event) {
  return `${event.id}@calendrier`;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

/**
 * Convert a single event to a VEVENT block (lines array).
 * @param {Object} event
 * @returns {string[]} lines (without CRLF terminators).
 */
export function eventToVEvent(event) {
  const lines = [];
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${makeUID(event)}`);
  lines.push(`DTSTAMP:${toICSDate(new Date().toISOString().slice(0, 10))}T000000Z`);

  const startDate = event.startDate || event.date || '';
  const endDate = event.endDate || startDate;
  const hasTime = Boolean(event.startTime);

  if (hasTime) {
    // Timed event
    lines.push(`DTSTART:${toICSDateTime(startDate, event.startTime)}`);
    if (event.endTime) {
      // If multi-day with time, end on the endDate at endTime
      lines.push(`DTEND:${toICSDateTime(endDate, event.endTime)}`);
    } else {
      // Default: 1 hour duration
      const [h, m] = event.startTime.split(':').map(Number);
      const endH = String(h + 1).padStart(2, '0');
      const endM = String(m).padStart(2, '0');
      lines.push(`DTEND:${toICSDateTime(startDate, `${endH}:${endM}`)}`);
    }
  } else {
    // All-day event — DTEND is exclusive (day after last day)
    lines.push(`DTSTART;VALUE=DATE:${toICSDate(startDate)}`);
    lines.push(`DTEND;VALUE=DATE:${nextDayICS(endDate)}`);
  }

  lines.push(`SUMMARY:${escapeText(event.title)}`);

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  }

  lines.push('END:VEVENT');
  return lines;
}

/**
 * Generate a complete .ics file string from a single event.
 * @param {Object} event
 * @returns {string} Full ICS file content.
 */
export function eventToICS(event) {
  return eventsToICS([event]);
}

/**
 * Generate a complete .ics file string from an array of events.
 * @param {Object[]} events
 * @returns {string} Full ICS file content (CRLF line endings).
 */
export function eventsToICS(events) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendrier//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const ev of events) {
    lines.push(...eventToVEvent(ev));
  }

  lines.push('END:VCALENDAR');

  // Fold long lines and join with CRLF
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/**
 * Trigger a file download in the browser.
 * @param {string} content  – file content.
 * @param {string} filename – suggested filename.
 */
export function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export a single event as a downloadable .ics file.
 * @param {Object} event
 */
export function exportEvent(event) {
  const ics = eventToICS(event);
  const safeName = (event.title || 'event').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadFile(ics, `${safeName}.ics`);
}

/**
 * Export all events as a single downloadable .ics file.
 * @param {Object[]} events
 */
export function exportAllEvents(events) {
  const ics = eventsToICS(events);
  downloadFile(ics, 'calendrier_events.ics');
}
