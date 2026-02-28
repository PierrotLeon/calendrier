/**
 * @file useSettings.test.js
 * @description Unit tests for the useSettings hook.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../../hooks/useSettings';
import { DEFAULT_EVENT_RULES, SETTINGS_KEY } from '../../constants';

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initialises with default rules when nothing is stored', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.rules).toEqual(DEFAULT_EVENT_RULES);
  });

  it('loads persisted rules from localStorage', () => {
    const custom = [{ id: 'x', name: 'X', pattern: 'x', color: '#000', startTime: '', endTime: '', enabled: true }];
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(custom));
    const { result } = renderHook(() => useSettings());
    expect(result.current.rules).toEqual(custom);
  });

  it('addRule appends a new rule', () => {
    const { result } = renderHook(() => useSettings());
    const initialCount = result.current.rules.length;

    act(() => {
      result.current.addRule({ name: 'New', pattern: 'new', color: '#FFF', startTime: '', endTime: '', enabled: true });
    });

    expect(result.current.rules.length).toBe(initialCount + 1);
    expect(result.current.rules.at(-1).name).toBe('New');
    expect(result.current.rules.at(-1).id).toBeTruthy(); // auto-generated id
  });

  it('updateRule modifies an existing rule', () => {
    const { result } = renderHook(() => useSettings());
    const firstId = result.current.rules[0].id;

    act(() => {
      result.current.updateRule(firstId, { name: 'Renamed' });
    });

    expect(result.current.rules.find((r) => r.id === firstId).name).toBe('Renamed');
  });

  it('deleteRule removes a rule by id', () => {
    const { result } = renderHook(() => useSettings());
    const firstId = result.current.rules[0].id;
    const initialCount = result.current.rules.length;

    act(() => {
      result.current.deleteRule(firstId);
    });

    expect(result.current.rules.length).toBe(initialCount - 1);
    expect(result.current.rules.find((r) => r.id === firstId)).toBeUndefined();
  });

  it('resetToDefaults restores the default rule set', () => {
    const { result } = renderHook(() => useSettings());

    // Modify state first
    act(() => {
      result.current.deleteRule(result.current.rules[0].id);
    });
    expect(result.current.rules.length).toBe(DEFAULT_EVENT_RULES.length - 1);

    act(() => {
      result.current.resetToDefaults();
    });
    expect(result.current.rules).toEqual(DEFAULT_EVENT_RULES);
  });

  it('getAutoSuggestion returns a suggestion for matching title', () => {
    const { result } = renderHook(() => useSettings());
    // Default rules include one for "meeting"
    const suggestion = result.current.getAutoSuggestion('Team Meeting', '');
    expect(suggestion).not.toBeNull();
    expect(suggestion.ruleName).toBe('Meeting');
  });

  it('getAutoSuggestion returns null when no rule matches', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.getAutoSuggestion('Random stuff', '')).toBeNull();
  });
});
