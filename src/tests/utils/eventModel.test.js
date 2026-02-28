/**
 * @file eventModel.test.js
 * @description Unit tests for event factory and validation.
 */

import { describe, it, expect } from 'vitest';
import {
  createEvent,
  validateEvent,
  isMultiDay,
  eventCoversDate,
} from '../../utils/eventModel';
import { DEFAULT_EVENT_COLOR } from '../../constants';

describe('eventModel', () => {
  describe('createEvent', () => {
    it('generates a unique id', () => {
      const a = createEvent({ title: 'A', date: '2026-01-01' });
      const b = createEvent({ title: 'B', date: '2026-01-02' });
      expect(a.id).toBeTruthy();
      expect(b.id).toBeTruthy();
      expect(a.id).not.toBe(b.id);
    });

    it('applies default colour', () => {
      const ev = createEvent({ title: 'Test', date: '2026-01-01' });
      expect(ev.color).toBe(DEFAULT_EVENT_COLOR);
    });

    it('applies overrides', () => {
      const ev = createEvent({ title: 'Custom', date: '2026-03-15', color: '#FF0000' });
      expect(ev.title).toBe('Custom');
      expect(ev.date).toBe('2026-03-15');
      expect(ev.color).toBe('#FF0000');
    });

    it('includes a createdAt timestamp', () => {
      const ev = createEvent({ title: 'T', date: '2026-01-01' });
      expect(ev.createdAt).toBeTruthy();
      expect(() => new Date(ev.createdAt)).not.toThrow();
    });

    it('sets startDate and endDate from date', () => {
      const ev = createEvent({ title: 'T', date: '2026-05-10' });
      expect(ev.startDate).toBe('2026-05-10');
      expect(ev.endDate).toBe('2026-05-10');
      expect(ev.date).toBe('2026-05-10');
    });

    it('sets startDate and endDate from explicit startDate', () => {
      const ev = createEvent({ title: 'T', startDate: '2026-05-10', endDate: '2026-05-12' });
      expect(ev.startDate).toBe('2026-05-10');
      expect(ev.endDate).toBe('2026-05-12');
      expect(ev.date).toBe('2026-05-10');
    });

    it('defaults endDate to startDate when not provided', () => {
      const ev = createEvent({ title: 'T', startDate: '2026-05-10' });
      expect(ev.endDate).toBe('2026-05-10');
    });
  });

  describe('validateEvent', () => {
    it('returns no errors for a valid event', () => {
      const errors = validateEvent({ title: 'Meeting', date: '2026-03-01' });
      expect(errors).toHaveLength(0);
    });

    it('requires a title', () => {
      const errors = validateEvent({ title: '', date: '2026-03-01' });
      expect(errors.some((e) => e.toLowerCase().includes('titre'))).toBe(true);
    });

    it('requires a date', () => {
      const errors = validateEvent({ title: 'OK', date: '' });
      expect(errors.some((e) => e.toLowerCase().includes('date'))).toBe(true);
    });

    it('rejects end time before start time on same day', () => {
      const errors = validateEvent({
        title: 'Bad range',
        startDate: '2026-03-01',
        date: '2026-03-01',
        startTime: '14:00',
        endTime: '13:00',
      });
      expect(errors.some((e) => e.toLowerCase().includes('heure de fin'))).toBe(true);
    });

    it('accepts missing times', () => {
      const errors = validateEvent({
        title: 'No times',
        date: '2026-03-01',
        startTime: '',
        endTime: '',
      });
      expect(errors).toHaveLength(0);
    });

    it('rejects endDate before startDate', () => {
      const errors = validateEvent({
        title: 'Bad range',
        startDate: '2026-03-05',
        endDate: '2026-03-02',
      });
      expect(errors.some((e) => e.toLowerCase().includes('date de fin'))).toBe(true);
    });

    it('accepts endDate equal to startDate', () => {
      const errors = validateEvent({
        title: 'Same day',
        startDate: '2026-03-05',
        endDate: '2026-03-05',
      });
      expect(errors).toHaveLength(0);
    });

    it('allows endTime before startTime on multi-day events', () => {
      const errors = validateEvent({
        title: 'Multi',
        startDate: '2026-03-01',
        endDate: '2026-03-03',
        startTime: '22:00',
        endTime: '08:00',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('isMultiDay', () => {
    it('returns false for single-day events', () => {
      expect(isMultiDay({ startDate: '2026-03-01', endDate: '2026-03-01' })).toBe(false);
    });

    it('returns true when endDate > startDate', () => {
      expect(isMultiDay({ startDate: '2026-03-01', endDate: '2026-03-03' })).toBe(true);
    });

    it('returns false when dates are missing', () => {
      expect(isMultiDay({})).toBe(false);
    });
  });

  describe('eventCoversDate', () => {
    const singleDay = { startDate: '2026-03-05', endDate: '2026-03-05', date: '2026-03-05' };
    const multiDay = { startDate: '2026-03-05', endDate: '2026-03-08', date: '2026-03-05' };

    it('matches exact date for single-day event', () => {
      expect(eventCoversDate(singleDay, '2026-03-05')).toBe(true);
    });

    it('rejects non-matching date for single-day event', () => {
      expect(eventCoversDate(singleDay, '2026-03-06')).toBe(false);
    });

    it('matches start date of multi-day event', () => {
      expect(eventCoversDate(multiDay, '2026-03-05')).toBe(true);
    });

    it('matches end date of multi-day event', () => {
      expect(eventCoversDate(multiDay, '2026-03-08')).toBe(true);
    });

    it('matches middle date of multi-day event', () => {
      expect(eventCoversDate(multiDay, '2026-03-06')).toBe(true);
    });

    it('rejects date before multi-day event', () => {
      expect(eventCoversDate(multiDay, '2026-03-04')).toBe(false);
    });

    it('rejects date after multi-day event', () => {
      expect(eventCoversDate(multiDay, '2026-03-09')).toBe(false);
    });

    it('falls back to legacy date field', () => {
      const legacy = { date: '2026-03-05' };
      expect(eventCoversDate(legacy, '2026-03-05')).toBe(true);
      expect(eventCoversDate(legacy, '2026-03-06')).toBe(false);
    });
  });
});
