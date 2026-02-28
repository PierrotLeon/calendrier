/**
 * @file useEvents.test.js
 * @description Unit tests for the useEvents hook.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEvents } from '../../hooks/useEvents';

describe('useEvents', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty array when localStorage is empty', () => {
    const { result } = renderHook(() => useEvents());
    expect(result.current.events).toEqual([]);
  });

  it('addEvent adds a new event with a generated id', () => {
    const { result } = renderHook(() => useEvents());
    act(() => {
      result.current.addEvent({ title: 'Test', date: '2026-03-01' });
    });
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].title).toBe('Test');
    expect(result.current.events[0].id).toBeTruthy();
  });

  it('updateEvent modifies an existing event', () => {
    const { result } = renderHook(() => useEvents());
    let id;
    act(() => {
      const ev = result.current.addEvent({ title: 'Old', date: '2026-03-01' });
      id = ev.id;
    });
    act(() => {
      result.current.updateEvent(id, { title: 'New' });
    });
    expect(result.current.events[0].title).toBe('New');
    expect(result.current.events[0].date).toBe('2026-03-01'); // unchanged
  });

  it('deleteEvent removes an event by id', () => {
    const { result } = renderHook(() => useEvents());
    let id;
    act(() => {
      const ev = result.current.addEvent({ title: 'Remove me', date: '2026-03-01' });
      id = ev.id;
    });
    act(() => {
      result.current.deleteEvent(id);
    });
    expect(result.current.events).toHaveLength(0);
  });

  it('getEventsForDate filters by ISO date string', () => {
    const { result } = renderHook(() => useEvents());
    act(() => {
      result.current.addEvent({ title: 'A', date: '2026-03-01' });
      result.current.addEvent({ title: 'B', date: '2026-03-02' });
      result.current.addEvent({ title: 'C', date: '2026-03-01' });
    });
    const filtered = result.current.getEventsForDate('2026-03-01');
    expect(filtered).toHaveLength(2);
    expect(filtered.map((e) => e.title).sort()).toEqual(['A', 'C']);
  });

  it('persists events to localStorage', () => {
    const { result } = renderHook(() => useEvents());
    act(() => {
      result.current.addEvent({ title: 'Persisted', date: '2026-04-01' });
    });
    const stored = JSON.parse(localStorage.getItem('calendrier_events'));
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('Persisted');
  });
});
