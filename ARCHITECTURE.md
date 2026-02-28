# Architecture — Calendrier

This document describes the high-level architecture, design decisions, and module boundaries of the Calendrier calendar application.

---

## 1. Technology Stack

| Layer          | Technology                        | Why                                                                                   |
| -------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| UI framework   | React 19                          | Composable components, hooks-based state, large ecosystem.                            |
| Build tool     | Vite 7                            | Near-instant HMR, ES-module-first, zero-config for React.                             |
| Date handling  | date-fns                          | Immutable, tree-shakable, no heavy moment.js dependency.                              |
| Unique IDs     | uuid (v4)                         | Collision-free event identifiers without a server.                                    |
| Testing        | Vitest + React Testing Library    | Vite-native test runner; RTL encourages testing user behaviour, not implementation.   |
| Linting        | ESLint 9 (flat config)            | Catches bugs early; `react-hooks` and `react-refresh` plugins enforce best practices. |

---

## 2. Module Map

```
src/
├── constants/        ← Single source of truth for magic strings, colour palettes, keys, breakpoints, default rules.
├── utils/            ← Pure functions with zero side-effects (date math, event factory, rule engine).
├── services/         ← Side-effectful I/O (localStorage today; could become HTTP/WebSocket).
├── hooks/            ← Stateful React logic extracted from components.
├── components/       ← Presentational + container components, one folder each.
├── styles/           ← CSS custom-property theme + component styles + responsive breakpoints.
└── tests/            ← Mirrors the src/ tree; one test file per module.
```

### Dependency flow (top → bottom = allowed)

```
components → hooks → services → utils → constants
                                ↗
              hooks → utils → constants
```

**Rules:**
- `constants/` and `utils/` never import from `components/` or `hooks/`.
- `services/` never import from React.
- `components/` may import `hooks/`, `utils/`, and `constants/` but never `services/` directly.

---

## 3. State Management

The application avoids external state libraries. Four custom hooks own all state:

| Hook           | Responsibility                                          | Persistence        |
| -------------- | ------------------------------------------------------- | ------------------ |
| `useCalendar`  | Current date, view mode (month/week), derived day grid. | None (ephemeral).  |
| `useEvents`    | Event CRUD array + `getEventsForDate` filter.           | `localStorage`.    |
| `useModal`     | Boolean open/close + optional payload data.             | None (ephemeral).  |
| `useSettings`  | Event-type rules CRUD + `getAutoSuggestion` helper.     | `localStorage`.    |

`App.jsx` composes these hooks and threads the resulting state + callbacks down to child components via props. This keeps each hook testable in isolation and each component a pure function of its props.

---

## 4. Component Hierarchy

```
App
├── CalendarHeader       – navigation bar (prev/next, today, month/year label, view toggle, sidebar toggle, settings gear)
├── Sidebar              – selected-day detail panel + "New Event" button (overlay on mobile, inline on desktop)
│   └── EventList        – vertical list of EventCard items for the selected day
├── CalendarGrid         – weekday header row + grid of DayCell components
│   └── DayCell          – single day: number badge, up to 2 event chips, "+N more"
├── EventModal           – overlay form for create / edit / delete (with soft autofill suggestion banner)
└── SettingsPanel        – slide-over panel for managing event-type regex rules
```

Each component lives in its own folder with an `index.js` barrel re-export, making imports clean:

```js
import CalendarHeader from './components/CalendarHeader';
```

---

## 5. Styling Strategy

All design tokens are defined as **CSS custom properties** in `src/styles/theme.css`:

```css
:root {
  --color-primary: #4F46E5;
  --font-size-sm:  0.875rem;
  --space-4:       1rem;
  ...
}
```

Component styles in `src/styles/components.css` reference only these variables. This means:

- **Re-theming** is a single-file edit.
- **Dark mode** can be added by overriding variables inside `[data-theme="dark"]` or a `prefers-color-scheme` media query (a commented-out block is already provided).
- **Responsive adjustments** are handled in `src/styles/responsive.css` using mobile-first media queries at 414 px, 768 px, and 1024 px breakpoints.

---

## 6. Data Model

### Event

```json
{
  "id": "uuid-v4",
  "title": "Team standup",
  "date": "2026-02-28",
  "startTime": "09:00",
  "endTime": "09:15",
  "description": "Daily sync call",
  "color": "#4F46E5",
  "createdAt": "2026-02-28T08:00:00.000Z"
}
```

Factory: `createEvent(overrides)` in `utils/eventModel.js`.
Validation: `validateEvent(event)` returns an array of error strings (empty = valid).

---

## 7. Persistence

Currently backed by `localStorage` via `services/storageService.js`. The service exposes six functions:

| Function           | Description                                  |
| ------------------ | -------------------------------------------- |
| `loadEvents()`     | Read + JSON-parse events; returns `[]` on failure. |
| `saveEvents()`     | JSON-stringify + write events.               |
| `clearEvents()`    | Remove the events key entirely.              |
| `loadSettings()`   | Read + JSON-parse rules; returns `null` on failure. |
| `saveSettings()`   | JSON-stringify + write rules.                |
| `clearSettings()`  | Remove the settings key entirely.            |

Because all storage access is isolated here, swapping to IndexedDB, a REST API, or a WebSocket sync layer requires changing **only this file**.

---

## 8. Testing Strategy

```
132 tests across 13 files (all passing)
```

| Layer       | What is tested                                                  |
| ----------- | --------------------------------------------------------------- |
| `utils/`    | Date grid generation, navigation, formatting, parsing, validation, regex rule matching. |
| `services/` | Load, save, clear for events & settings, corrupted-data recovery. |
| `hooks/`    | State transitions: calendar navigation, event CRUD, modal open/close, settings rule CRUD. |
| Components  | Rendering output, user interactions (clicks, keyboard), autofill suggestion banners, settings panel CRUD, integration flow (create event end-to-end). |

Tests use `jsdom` environment with a `localStorage` polyfill defined in `tests/setup.js`.

---

## 9. Extending the App

| Feature                 | Where to change                                         |
| ----------------------- | ------------------------------------------------------- |
| Add a new event field   | `utils/eventModel.js` → `EventModal` → `EventCard`.    |
| New view mode (e.g. day)| `constants/` `VIEW_MODES` → `useCalendar` → `CalendarGrid`. |
| Remote sync             | Replace/extend `services/storageService.js`.            |
| New colour palette      | `constants/` `EVENT_COLORS`.                            |
| Dark mode               | Uncomment the block in `styles/theme.css`.              |
| Localisation            | Add an i18n layer and swap `constants/` month/day names.|
| New auto-match rule     | Add to `constants/` `DEFAULT_EVENT_RULES` or use the Settings panel at runtime. |
| Adjust breakpoints      | Edit `constants/` `BREAKPOINTS` + `styles/responsive.css`. |
