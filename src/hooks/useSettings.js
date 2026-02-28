/**
 * @module useSettings
 * @description Manages event-type rules (auto-match settings) with persistence.
 *
 * Loads rules from localStorage on init (falling back to DEFAULT_EVENT_RULES),
 * and persists on every change. Exposes CRUD operations for rules and a
 * helper to get autofill suggestions for a given event title/description.
 */

import { useState, useCallback, useEffect } from 'react';
import { DEFAULT_EVENT_RULES } from '../constants';
import { loadSettings, saveSettings } from '../services/storageService';
import { getSuggestion } from '../utils/ruleEngine';
import { v4 as uuidv4 } from 'uuid';

/**
 * @returns {Object} settings state and rule-management helpers.
 */
export function useSettings() {
  const [rules, setRules] = useState(() => {
    const stored = loadSettings();
    return stored ?? [...DEFAULT_EVENT_RULES];
  });

  /* Persist to localStorage whenever rules change. */
  useEffect(() => {
    saveSettings(rules);
  }, [rules]);

  /* ---- CRUD for rules ---- */

  /**
   * Add a new event-type rule.
   * @param {Object} ruleData – partial rule (name, pattern, color, etc.).
   * @returns {Object} the created rule with a generated `id`.
   */
  const addRule = useCallback((ruleData) => {
    const newRule = {
      id: uuidv4(),
      name: '',
      pattern: '',
      color: '#4F46E5',
      startTime: '',
      endTime: '',
      enabled: true,
      ...ruleData,
    };
    setRules((prev) => [...prev, newRule]);
    return newRule;
  }, []);

  /**
   * Update an existing rule by `id`.
   * @param {string} id      – rule id.
   * @param {Object} updates – fields to overwrite.
   */
  const updateRule = useCallback((id, updates) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
  }, []);

  /**
   * Remove a rule by `id`.
   * @param {string} id
   */
  const deleteRule = useCallback((id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  /**
   * Reset rules to the built-in defaults.
   */
  const resetToDefaults = useCallback(() => {
    setRules([...DEFAULT_EVENT_RULES]);
  }, []);

  /**
   * Get a soft autofill suggestion for a given title + description.
   * @param {string} title
   * @param {string} [description='']
   * @returns {Object|null} `{ ruleName, color, startTime, endTime }` or `null`.
   */
  const getAutoSuggestion = useCallback(
    (title, description = '') => getSuggestion(rules, title, description),
    [rules],
  );

  return {
    rules,
    addRule,
    updateRule,
    deleteRule,
    resetToDefaults,
    getAutoSuggestion,
  };
}
