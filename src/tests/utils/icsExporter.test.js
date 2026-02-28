/**
 * @file icsExporter.test.js
 * @description Unit tests for the ICS (iCalendar) exporter.
 */

import { describe, it, expect } from 'vitest';
import { eventToVEvent, eventToICS, eventsToICS } from '../../utils/icsExporter';

describe('icsExporter', () => {
  const singleDayTimed = {
    id: 'evt-001',
    title: 'Team Meeting',
    startDate: '2026-03-15',
    endDate: '2026-03-15',
    date: '2026-03-15',
    startTime: '09:30',
    endTime: '10:30',
    description: 'Weekly sync-up',
    color: '#4F46E5',
  };

  const allDayEvent = {
    id: 'evt-002',
    title: 'Holiday',
    startDate: '2026-12-25',
    endDate: '2026-12-25',
    date: '2026-12-25',
    startTime: '',
    endTime: '',
    description: '',
    color: '#059669',
  };

  const multiDayEvent = {
    id: 'evt-003',
    title: 'Conference',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    date: '2026-06-10',
    startTime: '08:00',
    endTime: '17:00',
    description: 'Annual tech conference',
    color: '#D97706',
  };

  const multiDayAllDay = {
    id: 'evt-004',
    title: 'Vacation',
    startDate: '2026-07-01',
    endDate: '2026-07-05',
    date: '2026-07-01',
    startTime: '',
    endTime: '',
    description: 'Summer break',
    color: '#0284C7',
  };

  describe('eventToVEvent', () => {
    it('generates VEVENT for a timed single-day event', () => {
      const lines = eventToVEvent(singleDayTimed);
      expect(lines[0]).toBe('BEGIN:VEVENT');
      expect(lines[lines.length - 1]).toBe('END:VEVENT');
      expect(lines).toContain('DTSTART:20260315T093000');
      expect(lines).toContain('DTEND:20260315T103000');
      expect(lines).toContain('SUMMARY:Team Meeting');
      expect(lines).toContain('DESCRIPTION:Weekly sync-up');
    });

    it('generates all-day VEVENT with VALUE=DATE', () => {
      const lines = eventToVEvent(allDayEvent);
      expect(lines).toContain('DTSTART;VALUE=DATE:20261225');
      // DTEND is exclusive, so day after
      expect(lines).toContain('DTEND;VALUE=DATE:20261226');
      expect(lines).toContain('SUMMARY:Holiday');
    });

    it('generates multi-day timed VEVENT', () => {
      const lines = eventToVEvent(multiDayEvent);
      expect(lines).toContain('DTSTART:20260610T080000');
      expect(lines).toContain('DTEND:20260612T170000');
    });

    it('generates multi-day all-day VEVENT', () => {
      const lines = eventToVEvent(multiDayAllDay);
      expect(lines).toContain('DTSTART;VALUE=DATE:20260701');
      // DTEND exclusive: day after July 5 = July 6
      expect(lines).toContain('DTEND;VALUE=DATE:20260706');
    });

    it('includes UID with @calendrier suffix', () => {
      const lines = eventToVEvent(singleDayTimed);
      const uidLine = lines.find((l) => l.startsWith('UID:'));
      expect(uidLine).toBe('UID:evt-001@calendrier');
    });

    it('omits DESCRIPTION when empty', () => {
      const lines = eventToVEvent(allDayEvent);
      expect(lines.find((l) => l.startsWith('DESCRIPTION:'))).toBeUndefined();
    });

    it('defaults to 1-hour duration when only startTime is provided', () => {
      const ev = {
        id: 'evt-005',
        title: 'Quick',
        startDate: '2026-03-01',
        endDate: '2026-03-01',
        startTime: '14:00',
        endTime: '',
      };
      const lines = eventToVEvent(ev);
      expect(lines).toContain('DTSTART:20260301T140000');
      expect(lines).toContain('DTEND:20260301T150000');
    });
  });

  describe('eventToICS', () => {
    it('produces a full VCALENDAR wrapper', () => {
      const ics = eventToICS(singleDayTimed);
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('PRODID:-//Calendrier//FR');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('END:VEVENT');
    });

    it('uses CRLF line endings', () => {
      const ics = eventToICS(singleDayTimed);
      expect(ics).toContain('\r\n');
    });
  });

  describe('eventsToICS', () => {
    it('includes multiple VEVENTs', () => {
      const ics = eventsToICS([singleDayTimed, allDayEvent, multiDayEvent]);
      const beginCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
      const endCount = (ics.match(/END:VEVENT/g) || []).length;
      expect(beginCount).toBe(3);
      expect(endCount).toBe(3);
    });

    it('produces valid output for empty array', () => {
      const ics = eventsToICS([]);
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).not.toContain('BEGIN:VEVENT');
    });
  });

  describe('text escaping', () => {
    it('escapes special characters in SUMMARY', () => {
      const ev = {
        id: 'evt-esc',
        title: 'Meeting; with, commas\\and backslash',
        startDate: '2026-01-01',
        endDate: '2026-01-01',
        startTime: '',
        endTime: '',
        description: '',
      };
      const lines = eventToVEvent(ev);
      const summaryLine = lines.find((l) => l.startsWith('SUMMARY:'));
      expect(summaryLine).toContain('\\;');
      expect(summaryLine).toContain('\\,');
      expect(summaryLine).toContain('\\\\');
    });
  });
});
