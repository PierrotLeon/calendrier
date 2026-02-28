/**
 * @file ruleEngine.test.js
 * @description Unit tests for the regex-based rule engine utility.
 */

import { describe, it, expect } from 'vitest';
import { testRulePattern, findMatchingRule, getSuggestion } from '../../utils/ruleEngine';

/* ---- Sample rules ---- */
const rules = [
  { id: '1', name: 'Meeting', pattern: 'meeting|standup|sync', color: '#4F46E5', startTime: '09:00', endTime: '10:00', enabled: true },
  { id: '2', name: 'Sport', pattern: 'gym|run|yoga|swim', color: '#059669', startTime: '07:00', endTime: '08:00', enabled: true },
  { id: '3', name: 'Lunch', pattern: 'lunch|déjeuner', color: '#F59E0B', startTime: '12:00', endTime: '13:00', enabled: false },
];

describe('testRulePattern', () => {
  it('returns true when the pattern matches the text (case-insensitive)', () => {
    expect(testRulePattern('meeting', 'Team Meeting')).toBe(true);
    expect(testRulePattern('GYM', 'morning gym session')).toBe(true);
  });

  it('returns false when the pattern does not match', () => {
    expect(testRulePattern('meeting', 'dentist appointment')).toBe(false);
  });

  it('handles regex alternation', () => {
    expect(testRulePattern('meeting|standup', 'Daily Standup')).toBe(true);
    expect(testRulePattern('meeting|standup', 'Planning poker')).toBe(false);
  });

  it('returns false for invalid regex patterns', () => {
    expect(testRulePattern('[invalid(', 'anything')).toBe(false);
  });

  it('returns false for empty text', () => {
    expect(testRulePattern('meeting', '')).toBe(false);
  });

  it('returns false for empty pattern', () => {
    expect(testRulePattern('', 'anything')).toBe(false);
  });
});

describe('findMatchingRule', () => {
  it('returns the first matching enabled rule based on title', () => {
    const result = findMatchingRule(rules, 'Team Meeting');
    expect(result).not.toBeNull();
    expect(result.name).toBe('Meeting');
  });

  it('returns the first matching enabled rule based on description', () => {
    const result = findMatchingRule(rules, 'Exercise', 'Morning gym session');
    expect(result).not.toBeNull();
    expect(result.name).toBe('Sport');
  });

  it('skips disabled rules', () => {
    const result = findMatchingRule(rules, 'Lunch break');
    expect(result).toBeNull(); // 'Lunch' rule is disabled
  });

  it('returns null when no rules match', () => {
    expect(findMatchingRule(rules, 'Dentist')).toBeNull();
  });

  it('returns null for empty title and description', () => {
    expect(findMatchingRule(rules, '', '')).toBeNull();
  });
});

describe('getSuggestion', () => {
  it('returns a suggestion object when a rule matches', () => {
    const suggestion = getSuggestion(rules, 'Quick sync with the team');
    expect(suggestion).toEqual({
      ruleName: 'Meeting',
      color: '#4F46E5',
      startTime: '09:00',
      endTime: '10:00',
    });
  });

  it('returns null when no rule matches', () => {
    expect(getSuggestion(rules, 'Birthday party')).toBeNull();
  });

  it('includes time fields only if they exist on the rule', () => {
    const noTimeRules = [
      { id: '10', name: 'Custom', pattern: 'custom', color: '#FF0000', startTime: '', endTime: '', enabled: true },
    ];
    const suggestion = getSuggestion(noTimeRules, 'Custom event');
    expect(suggestion).toEqual({
      ruleName: 'Custom',
      color: '#FF0000',
      startTime: null,
      endTime: null,
    });
  });
});
