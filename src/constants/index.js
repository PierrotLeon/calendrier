/**
 * @module constants
 * @description Application-wide constants for the calendar app.
 *
 * Centralises all magic strings and configuration values so they can be
 * changed in a single place. Import what you need from here rather than
 * hard-coding values in components or utilities.
 */

/* ------------------------------------------------------------------ */
/*  Days & months                                                     */
/* ------------------------------------------------------------------ */

/** Ordered weekday labels starting on Monday (ISO convention). */
export const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/** Full weekday names, indexed the same way as `WEEKDAYS`. */
export const WEEKDAYS_FULL = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

/** Full month names (0-indexed like `Date.getMonth()`). */
export const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

/* ------------------------------------------------------------------ */
/*  Calendar views                                                    */
/* ------------------------------------------------------------------ */

/** Supported calendar view modes. */
export const VIEW_MODES = {
  MONTH: 'month',
  WEEK: 'week',
};

/* ------------------------------------------------------------------ */
/*  Event colour palette                                              */
/* ------------------------------------------------------------------ */

/**
 * Pre-defined colour options for calendar events.
 * Each entry has a human-readable `label` and a CSS-compatible `value`.
 */
export const EVENT_COLORS = [
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Rose', value: '#E11D48' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Amber', value: '#D97706' },
  { label: 'Sky', value: '#0284C7' },
  { label: 'Violet', value: '#7C3AED' },
  { label: 'Slate', value: '#475569' },
];

/** Default colour applied to newly created events. */
export const DEFAULT_EVENT_COLOR = EVENT_COLORS[0].value;

/* ------------------------------------------------------------------ */
/*  Local-storage keys                                                */
/* ------------------------------------------------------------------ */

/** Key under which persisted events are stored in `localStorage`. */
export const STORAGE_KEY = 'calendrier_events';

/** Key under which event-type rules (settings) are stored. */
export const SETTINGS_KEY = 'calendrier_settings';

/** Key under which custom palette colours are stored. */
export const CUSTOM_COLORS_KEY = 'calendrier_custom_colors';

/* ------------------------------------------------------------------ */
/*  Responsive breakpoints                                            */
/* ------------------------------------------------------------------ */

/**
 * Device-specific breakpoints in CSS pixels.
 *
 * - MOBILE_SM  : Small phones (Samsung Galaxy S series — 360px logical width)
 * - MOBILE_MD  : Medium phones (Fairphone 4 — 394px logical width)
 * - TABLET     : Tablets and small laptops
 * - DESKTOP    : Standard laptop / desktop screens
 *
 * These values are used in CSS media queries (see `responsive.css`)
 * and in the `useMediaQuery` hook for JS-side layout decisions.
 */
export const BREAKPOINTS = {
  MOBILE_SM: 360,   // Samsung Galaxy S21/S22/S23 etc.
  MOBILE_MD: 414,   // Fairphone 4 (394px), iPhone Plus-size, etc.
  TABLET: 768,
  DESKTOP: 1024,
};

/* ------------------------------------------------------------------ */
/*  Default event-type rules (auto-match)                             */
/* ------------------------------------------------------------------ */

/**
 * Built-in event templates for auto-matching colour and time.
 * Each template has:
 * - `id`          : unique identifier
 * - `name`        : human-readable label
 * - `pattern`     : regex string matched against event title + description
 * - `color`       : hex colour to suggest
 * - `startTime`   : optional default start time ("HH:mm")
 * - `endTime`     : optional default end time ("HH:mm")
 * - `enabled`     : whether the template is active
 *
 * Users can override / extend these in the templates panel.
 */
export const DEFAULT_EVENT_RULES = [
  {
    id: 'rule-meeting',
    name: 'Réunion',
    pattern: '\\b(meeting|réunion|standup|sync|call|conf)\\b',
    color: '#4F46E5',
    startTime: '09:00',
    endTime: '10:00',
    enabled: true,
  },
  {
    id: 'rule-sport',
    name: 'Sport / Exercice',
    pattern: '\\b(sport|gym|run|yoga|swim|athl|course|bike|workout|pilates|exercise|training|entraînement)\\b',
    color: '#059669',
    startTime: '18:00',
    endTime: '19:00',
    enabled: true,
  },
  {
    id: 'rule-lunch',
    name: 'Repas',
    pattern: '\\b(lunch|déjeuner|resto|restaurant|dinner|dîner|repas|meal|brunch)\\b',
    color: '#D97706',
    startTime: '12:00',
    endTime: '13:00',
    enabled: true,
  },
  {
    id: 'rule-doctor',
    name: 'Médical',
    pattern: '\\b(docteur|médecin|dentist|psy|hopital|hôpital|appointment|gyneco|médical|rdv)\\b',
    color: '#E11D48',
    startTime: '10:00',
    endTime: '11:00',
    enabled: true,
  },
  {
    id: 'rule-birthday',
    name: 'Anniversaire / Fête',
    pattern: '\\b(birthday|anniversaire|party|fête|celebration|célébration)\\b',
    color: '#7C3AED',
    startTime: '',
    endTime: '',
    enabled: true,
  },
];
