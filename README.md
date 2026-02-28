# Calendrier — Calendar App

A fully functional, production-grade calendar application built with **React 19**, **Vite**, and **date-fns**.

![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![Tests](https://img.shields.io/badge/Tests-184%20passing-green)

---

## ✨ Features

- **Month & Week views** — toggle between a full month grid and a focused week strip.
- **Event CRUD** — create, read, update, and delete events through a modal form.
- **Multi-day events** — events can span multiple days with a start and end date. Multi-day chips render with connected start/middle/end styling across the calendar grid.
- **Colour-coded events** — pick from 7 pre-defined colours for visual categorisation.
- **ICS export** — export individual events or all events as RFC 5545 compliant `.ics` files for import into Google Calendar, Outlook, Apple Calendar, etc.
- **Persistent storage** — events are saved to `localStorage` and survive page reloads.
- **Sidebar day detail** — click any day to see its events listed in the sidebar.
- **24-hour time format** — European-style HH:mm time throughout the application.
- **Keyboard accessible** — all interactive elements are focusable and operable via keyboard.
- **Themeable** — all visual tokens (colours, spacing, typography) are CSS custom properties in a single file.
- **Responsive layouts** — mobile-first CSS for Samsung Galaxy (360 px), Fairphone 4 (414 px), tablets (768 px), and desktop (1024 px+). Sidebar collapses to an overlay on mobile.
- **Device preview** — a dedicated preview page (`/preview.html`) renders the app in iframes at phone portrait/landscape and tablet portrait/landscape sizes.
- **Settings panel** — define event-type rules with regex patterns, colours, and default times.
- **Soft autofill** — when creating an event, the rule engine suggests a colour and time based on the title. Suggestions appear as a dismissible banner and never override manual input.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Open the device preview directly (dev tool — not part of the app)
npm run dev:preview
# → Opens http://localhost:5173/preview.html with phone, tablet & desktop iframes

# Test on your phone (same Wi-Fi network)
# Starts the dev server and exposes it on the local network.
# Open the Network URL shown in the terminal on your phone's browser.
npx vite --host

# Run the test suite
npm test

# Build for production
npm run build
```

## 📁 Project Structure

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for a detailed breakdown.

```
src/
├── components/          # React UI components (one folder per component)
│   ├── CalendarGrid/
│   ├── CalendarHeader/
│   ├── DayCell/
│   ├── EventList/
│   ├── EventModal/
│   ├── SettingsPanel/
│   └── Sidebar/
├── hooks/               # Custom React hooks
│   ├── useCalendar.js
│   ├── useEvents.js
│   ├── useModal.js
│   └── useSettings.js
├── services/            # Data persistence layer
│   └── storageService.js
├── utils/               # Pure utility functions
│   ├── dateUtils.js
│   ├── eventModel.js   # Event factory, validation, multi-day helpers
│   ├── icsExporter.js  # RFC 5545 .ics file generation & download
│   └── ruleEngine.js
├── constants/           # App-wide constants & configuration
│   └── index.js
├── styles/              # CSS theme tokens & component styles
│   ├── theme.css
│   ├── components.css
│   └── responsive.css
├── tests/               # Vitest + React Testing Library tests
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── App.jsx              # Root component
├── main.jsx             # Entry point
└── index.css            # Global reset + style imports
preview.html             # Device-preview page (phone/tablet iframes)
```

## 🎨 Customising the Theme

All visual design tokens live in **`src/styles/theme.css`** as CSS custom properties. To change colours, spacing, typography, or shadows, edit the `:root` block in that single file. A commented-out dark-mode override is included as a starting point.

## 🧪 Testing

```bash
npm test            # Single run
npm run test:watch  # Watch mode
```

The test suite covers:
- **Utility functions** — date manipulation, event model factory & validation.
- **Services** — localStorage read/write/clear, error recovery.
- **Hooks** — calendar navigation, event CRUD, modal state.
- **Components** — rendering, user interactions, integration flows.

## 📄 Scripts

| Script               | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `npm run dev`        | Start Vite dev server with HMR                                              |
| `npm run dev:preview`| Start dev server and open the device preview page (phone/tablet/desktop)    |
| `npm run build`      | Production build to `dist/`                                                 |
| `npm run preview`    | Preview the production build locally                                        |
| `npm run lint`       | Run ESLint                                                                  |
| `npm test`           | Run Vitest test suite                                                       |
| `npm run test:watch` | Vitest in watch mode                                                        |

## 📚 Further Reading

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — detailed architecture & design decisions.
- [`RECOMMENDATIONS.md`](./RECOMMENDATIONS.md) — guide for porting to Android and setting up Raspberry Pi sync.
