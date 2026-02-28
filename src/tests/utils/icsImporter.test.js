/**
 * @file icsImporter.test.js
 * @description Unit tests for the ICS (iCalendar) importer / parser.
 */

import { describe, it, expect } from 'vitest';
import { parseICS } from '../../utils/icsImporter';

const makeICS = (...vevents) => [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  ...vevents.flatMap((v) => ['BEGIN:VEVENT', ...v, 'END:VEVENT']),
  'END:VCALENDAR',
].join('\r\n');

describe('icsImporter – parseICS', () => {
  it('parses a timed single-day event', () => {
    const ics = makeICS([
      'SUMMARY:Team Sync',
      'DTSTART:20260315T093000',
      'DTEND:20260315T103000',
      'DESCRIPTION:Weekly call',
    ]);
    const events = parseICS(ics);
    expect(events).toHaveLength(1);
    const ev = events[0];
    expect(ev.title).toBe('Team Sync');
    expect(ev.startDate).toBe('2026-03-15');
    expect(ev.endDate).toBe('2026-03-15');
    expect(ev.startTime).toBe('09:30');
    expect(ev.endTime).toBe('10:30');
    expect(ev.description).toBe('Weekly call');
    expect(ev.id).toBeTruthy();
  });

  it('parses an all-day event (VALUE=DATE)', () => {
    const ics = makeICS([
      'SUMMARY:Jour de l\'an',
      'DTSTART;VALUE=DATE:20260101',
      'DTEND;VALUE=DATE:20260102',
    ]);
    const events = parseICS(ics);
    expect(events).toHaveLength(1);
    const ev = events[0];
    expect(ev.title).toBe("Jour de l'an");
    expect(ev.startDate).toBe('2026-01-01');
    // Exclusive DTEND 2026-01-02 → inclusive endDate 2026-01-01
    expect(ev.endDate).toBe('2026-01-01');
    expect(ev.startTime).toBe('');
    expect(ev.endTime).toBe('');
  });

  it('parses a multi-day all-day event with exclusive DTEND', () => {
    const ics = makeICS([
      'SUMMARY:Vacances',
      'DTSTART;VALUE=DATE:20260701',
      'DTEND;VALUE=DATE:20260706',
    ]);
    const events = parseICS(ics);
    expect(events).toHaveLength(1);
    expect(events[0].startDate).toBe('2026-07-01');
    // Exclusive July 6 → inclusive July 5
    expect(events[0].endDate).toBe('2026-07-05');
  });

  it('handles multiple VEVENTs in one file', () => {
    const ics = makeICS(
      ['SUMMARY:Event A', 'DTSTART;VALUE=DATE:20260501'],
      ['SUMMARY:Event B', 'DTSTART;VALUE=DATE:20260502'],
    );
    const events = parseICS(ics);
    expect(events).toHaveLength(2);
    expect(events[0].title).toBe('Event A');
    expect(events[1].title).toBe('Event B');
  });

  it('uses default colour and allows override', () => {
    const ics = makeICS(['SUMMARY:Test', 'DTSTART;VALUE=DATE:20260101']);
    const defaults = parseICS(ics);
    expect(defaults[0].color).toBeTruthy();

    const custom = parseICS(ics, { defaultColor: '#FF0000' });
    expect(custom[0].color).toBe('#FF0000');
  });

  it('sets isHoliday flag when option is true', () => {
    const ics = makeICS(['SUMMARY:Noël', 'DTSTART;VALUE=DATE:20261225']);
    const events = parseICS(ics, { isHoliday: true });
    expect(events[0].isHoliday).toBe(true);
  });

  it('unescapes ICS text values', () => {
    const ics = makeICS([
      'SUMMARY:Title with\\, comma',
      'DTSTART;VALUE=DATE:20260101',
      'DESCRIPTION:Line1\\nLine2',
    ]);
    const events = parseICS(ics);
    expect(events[0].title).toBe('Title with, comma');
    expect(events[0].description).toBe('Line1\nLine2');
  });

  it('handles folded (continuation) lines', () => {
    // RFC 5545: line continuation is CRLF followed by a space (consumed)
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'SUMMARY:Very long ',
      ' title that wraps',
      'DTSTART;VALUE=DATE:20260601',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const events = parseICS(ics);
    expect(events[0].title).toBe('Very long title that wraps');
  });

  it('returns empty array for empty or invalid input', () => {
    expect(parseICS('')).toEqual([]);
    expect(parseICS('not an ics file')).toEqual([]);
  });

  it('handles UTC datetime (trailing Z)', () => {
    const ics = makeICS([
      'SUMMARY:UTC Meeting',
      'DTSTART:20260315T140000Z',
      'DTEND:20260315T150000Z',
    ]);
    const events = parseICS(ics);
    expect(events[0].startTime).toBe('14:00');
    expect(events[0].endTime).toBe('15:00');
  });
});
