/**
 * @file storageService.test.js
 * @description Unit tests for the localStorage-backed storage service.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadEvents, saveEvents, clearEvents,
  loadSettings, saveSettings, clearSettings,
} from '../../services/storageService';
import { STORAGE_KEY, SETTINGS_KEY } from '../../constants';

describe('storageService — events', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadEvents returns an empty array when nothing is stored', () => {
    expect(loadEvents()).toEqual([]);
  });

  it('saveEvents persists events and loadEvents retrieves them', () => {
    const events = [
      { id: '1', title: 'A', date: '2026-01-01' },
      { id: '2', title: 'B', date: '2026-01-02' },
    ];
    saveEvents(events);
    expect(loadEvents()).toEqual(events);
  });

  it('clearEvents removes all stored data', () => {
    saveEvents([{ id: '1', title: 'A', date: '2026-01-01' }]);
    clearEvents();
    expect(loadEvents()).toEqual([]);
  });

  it('loadEvents handles corrupted JSON gracefully', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(loadEvents()).toEqual([]);
  });
});

describe('storageService — settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadSettings returns null when nothing is stored', () => {
    expect(loadSettings()).toBeNull();
  });

  it('saveSettings persists and loadSettings retrieves rules', () => {
    const rules = [{ id: 'r1', name: 'Test', pattern: 'test', color: '#000' }];
    saveSettings(rules);
    expect(loadSettings()).toEqual(rules);
  });

  it('clearSettings removes stored settings', () => {
    saveSettings([{ id: 'r1' }]);
    clearSettings();
    expect(loadSettings()).toBeNull();
  });

  it('loadSettings handles corrupted JSON gracefully', () => {
    localStorage.setItem(SETTINGS_KEY, 'not-json!!!');
    expect(loadSettings()).toBeNull();
  });
});
