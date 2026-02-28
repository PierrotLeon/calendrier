/**
 * @module useHolidays
 * @description Loads French public holidays from a bundled ICS file.
 *
 * Returns a Map<string, string> where keys are ISO date strings ("2026-01-01")
 * and values are the holiday name ("1er janvier").
 *
 * The data comes from the official Etalab dataset:
 * https://etalab.github.io/jours-feries-france-data/ics/jours_feries_metropole.ics
 */

import { useState, useEffect } from 'react';
import { parseICS } from '../utils/icsImporter';

/** URL to the bundled holidays ICS placed in /public. */
const HOLIDAYS_URL = '/jours_feries_metropole.ics';

/**
 * @returns {{ holidays: Map<string, string>, loading: boolean }}
 */
export function useHolidays() {
  const [holidays, setHolidays] = useState(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const resp = await fetch(HOLIDAYS_URL);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const text = await resp.text();
        const events = parseICS(text, { isHoliday: true });

        if (cancelled) return;

        const map = new Map();
        for (const ev of events) {
          // If multi-day holiday, only record start date
          map.set(ev.startDate, ev.title);
        }
        setHolidays(map);
      } catch (err) {
        console.warn('[useHolidays] Failed to load holidays:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { holidays, loading };
}
