# Recommendations — Porting to Android & Raspberry Pi Multi-Calendar Sync

This document provides a comprehensive roadmap for two interconnected goals:

1. **Porting the Calendrier web app to a native Android application.**
2. **Setting up a Raspberry Pi server for multi-device calendar synchronisation.**

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Android App — Approach Options](#2-android-app--approach-options)
3. [Recommended Stack: React Native + Expo](#3-recommended-stack-react-native--expo)
4. [Code Reuse Strategy](#4-code-reuse-strategy)
5. [Raspberry Pi Sync Server](#5-raspberry-pi-sync-server)
6. [Sync Protocol Design](#6-sync-protocol-design)
7. [Networking & Connectivity](#7-networking--connectivity)
8. [Security Considerations](#8-security-considerations)
9. [Development Workflow](#9-development-workflow)
10. [Estimated Effort](#10-estimated-effort)
11. [Alternative Approaches](#11-alternative-approaches)

---

## 1. High-Level Architecture

```
┌──────────────────┐       HTTPS / WSS        ┌─────────────────────┐
│  Android App     │ ◄──────────────────────► │  Raspberry Pi       │
│  (React Native)  │                           │  Sync Server        │
│                  │                           │  (Node.js / Fastify)│
│  Local SQLite DB │                           │  SQLite / PostgreSQL│
└──────────────────┘                           └─────────────────────┘
        ▲                                               ▲
        │           HTTPS / WSS                         │
        └──────────────────────────────────────────────┘
                    ▲
                    │
         ┌─────────────────┐
         │  Web App (PWA)  │
         │  (This project) │
         └─────────────────┘
```

All clients (Android, web, potential iOS) talk to the same Raspberry Pi server. Each client maintains a **local database** for offline support and syncs changes when connectivity is available.

---

## 2. Android App — Approach Options

| Approach                  | Pros                                              | Cons                                                  | Code Reuse |
| ------------------------- | ------------------------------------------------- | ----------------------------------------------------- | ---------- |
| **React Native (Expo)**   | Reuse JS logic; single codebase for Android + iOS | Slightly less native feel; large bundle size            | 🟢 High    |
| **Capacitor (Ionic)**     | Wrap existing React web app directly              | WebView-based; less performant for heavy UIs            | 🟢 Very High |
| **Kotlin (Jetpack Compose)** | Fully native; best performance & UX            | Rewrite all UI; separate codebase                      | 🔴 Low     |
| **Flutter**               | Fast, beautiful UI; single codebase               | Dart language; cannot reuse existing JS modules         | 🔴 Low     |
| **PWA**                   | Zero rewrite; installable on Android              | Limited hardware access; no Play Store without wrapper  | 🟢 Maximum |

### Verdict

**For maximum code reuse**, start with a **PWA** (Progressive Web App) wrapper of this project — it can be installed directly on Android from the browser and shares 100 % of the code. If native capabilities are later needed (push notifications, background sync, widgets), graduate to **React Native with Expo**, which allows reusing the entire `utils/`, `services/`, `hooks/`, and `constants/` layers as-is.

---

## 3. Recommended Stack: React Native + Expo

If going fully native:

```
Expo SDK 52+          – managed workflow, OTA updates, push notifications
React Native 0.76+    – native bridge
date-fns              – same date library (already used)
@react-native-async-storage/async-storage – replaces localStorage
react-native-sqlite-storage  – offline-first local DB
Axios / ky            – HTTP client to talk to the Pi server
```

### Key Expo Modules

| Module                     | Purpose                                  |
| -------------------------- | ---------------------------------------- |
| `expo-notifications`       | Local & push reminders                   |
| `expo-secure-store`        | Encrypted credential storage             |
| `expo-background-fetch`    | Periodic sync when app is backgrounded   |
| `expo-network`             | Detect online/offline state              |

---

## 4. Code Reuse Strategy

The Calendrier project was deliberately designed for portability. The following modules can be copied (or shared via a monorepo) with **zero changes**:

| Module                | Android-ready? | Notes                                           |
| --------------------- | -------------- | ----------------------------------------------- |
| `constants/index.js`  | ✅ As-is        |                                                 |
| `utils/dateUtils.js`  | ✅ As-is        | Pure functions; no DOM or browser APIs.          |
| `utils/eventModel.js` | ✅ As-is        | Uses `uuid` — works in RN.                      |
| `hooks/useCalendar.js`| ✅ As-is        | React hooks — identical API in RN.              |
| `hooks/useEvents.js`  | ⚠️ Adapter      | Replace `storageService` import with an RN adapter (AsyncStorage or SQLite). |
| `hooks/useModal.js`   | ✅ As-is        |                                                 |
| `services/storageService.js` | ❌ Replace | Rewrite to use `AsyncStorage` or SQLite.        |
| Components (JSX)      | ❌ Rewrite      | Replace HTML elements with RN `<View>`, `<Text>`, `<Pressable>`. |
| Styles (CSS)          | ❌ Rewrite      | Convert to RN `StyleSheet.create()` objects. Keep the same token values. |

### Monorepo Setup (optional)

```
packages/
├── core/           ← constants, utils, hooks, event model (shared)
├── web/            ← this Vite + React project
├── mobile/         ← Expo / React Native project
└── server/         ← Raspberry Pi sync server
```

Use a tool like **Turborepo**, **Nx**, or **npm workspaces** to manage the monorepo.

---

## 5. Raspberry Pi Sync Server

### 5.1 Hardware

| Item                           | Recommendation                     |
| ------------------------------ | ---------------------------------- |
| Board                          | Raspberry Pi 4 (2 GB+ RAM) or Pi 5 |
| Storage                        | 32 GB+ SD card (or SSD via USB)    |
| OS                             | Raspberry Pi OS Lite (64-bit)      |
| Network                        | Ethernet preferred; Wi-Fi fallback |

### 5.2 Software Stack

```
Node.js 20 LTS       – runtime (installable via nvm on ARM)
Fastify 5             – HTTP framework (lightweight, fast, schema-validated)
SQLite 3 (better-sqlite3) – embedded DB, no separate process, easy backups
                        OR
PostgreSQL 16         – if you anticipate many concurrent users
PM2                   – process manager for auto-restart & log rotation
Caddy / Nginx         – reverse proxy + automatic HTTPS via Let's Encrypt
```

### 5.3 API Design (REST + WebSocket)

#### REST Endpoints

```
GET    /api/events              → list all events (supports ?since=<ISO> for delta sync)
GET    /api/events/:id          → get a single event
POST   /api/events              → create a new event
PUT    /api/events/:id          → update an event
DELETE /api/events/:id          → delete an event
POST   /api/sync                → bulk sync (client sends local changes, receives server changes)
GET    /api/health              → server health check
```

#### WebSocket Channel

```
ws://pi.local:3001/ws

Messages:
  server → client:  { type: "EVENT_CREATED",  payload: { ... } }
  server → client:  { type: "EVENT_UPDATED",  payload: { ... } }
  server → client:  { type: "EVENT_DELETED",  payload: { id: "..." } }
  client → server:  { type: "SYNC_REQUEST",   payload: { lastSyncTimestamp: "..." } }
```

Use WebSockets for **real-time push** when the app is open; fall back to REST polling or background fetch when it is not.

### 5.4 Database Schema

```sql
CREATE TABLE events (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  date        TEXT NOT NULL,           -- "yyyy-MM-dd"
  start_time  TEXT,                    -- "HH:mm"
  end_time    TEXT,                    -- "HH:mm"
  description TEXT DEFAULT '',
  color       TEXT DEFAULT '#4F46E5',
  created_at  TEXT NOT NULL,           -- ISO-8601
  updated_at  TEXT NOT NULL,           -- ISO-8601, used for conflict resolution
  deleted     INTEGER DEFAULT 0,       -- soft-delete for sync tombstones
  user_id     TEXT                      -- for multi-user support
);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_updated ON events(updated_at);
```

### 5.5 Pi Setup Script (example)

```bash
#!/usr/bin/env bash
# Run on a fresh Raspberry Pi OS Lite installation.

# 1. System update
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20

# 3. Install PM2
npm install -g pm2

# 4. Clone your server repo
git clone https://github.com/youruser/calendrier-server.git ~/calendrier-server
cd ~/calendrier-server
npm install

# 5. Start with PM2
pm2 start server.js --name calendrier
pm2 save
pm2 startup  # follow instructions to enable on boot

# 6. (Optional) Install Caddy for HTTPS
sudo apt install -y caddy
# Configure /etc/caddy/Caddyfile with your domain
```

---

## 6. Sync Protocol Design

### 6.1 Conflict Resolution — Last-Write-Wins (LWW)

The simplest and most pragmatic strategy:

1. Every event has an `updatedAt` timestamp set **by the client** at the moment of edit.
2. On sync, the server compares `updatedAt` of the incoming event with the stored one.
3. The version with the **later** `updatedAt` wins.
4. Deleted events are **soft-deleted** (`deleted = 1`) so that deletions propagate to other clients.

> ⚠️ Make sure clocks are reasonably in sync (NTP). For higher fidelity, consider **vector clocks** or **CRDTs** (e.g., Automerge), but LWW is sufficient for a personal/family calendar.

### 6.2 Sync Flow

```
Client                              Server
  │                                    │
  ├── POST /api/sync ─────────────────►│
  │   { lastSync: "2026-02-27T10:00Z", │
  │     changes: [ ... ] }             │
  │                                    │
  │   ◄───────────────────────────────┤
  │   { serverChanges: [ ... ],        │
  │     newSyncTimestamp: "2026-02-28T12:00Z" }
  │                                    │
  │  (apply serverChanges locally)     │
  │  (update lastSync)                 │
```

### 6.3 Offline Queue

On the Android client, when the Pi is unreachable:

1. Mutations are written to a **local pending queue** (SQLite table `sync_queue`).
2. When connectivity is restored (detected via `expo-network` or `NetInfo`), the queue is flushed in order.
3. The server responds with any remote changes that happened during the offline period.

---

## 7. Networking & Connectivity

### Local Network (LAN)

- The Pi is accessible at a `.local` mDNS address (e.g., `calendrier.local`) or a static IP.
- Use **Caddy** or **Nginx** as a reverse proxy for TLS (self-signed cert, or Let's Encrypt if the Pi has a public domain).

### Remote Access (WAN)

For accessing the Pi from outside your home network:

| Method                          | Complexity | Security        |
| ------------------------------- | ---------- | --------------- |
| **Tailscale / ZeroTier**        | Low        | Excellent (mesh VPN, no port forwarding) |
| **WireGuard VPN**               | Medium     | Excellent       |
| **Cloudflare Tunnel**           | Low        | Good (no open ports) |
| **Port forwarding + DynDNS**    | Medium     | Moderate (exposed port) |

**Recommendation:** Use **Tailscale** — it's free for personal use, requires zero port forwarding, and provides encrypted peer-to-peer connections. Each device (phone, Pi) joins the same Tailscale network and can reach each other by hostname.

---

## 8. Security Considerations

| Concern               | Mitigation                                                                      |
| ---------------------- | ------------------------------------------------------------------------------- |
| Data in transit        | TLS everywhere (Caddy auto-HTTPS, or Tailscale's built-in WireGuard encryption).|
| Authentication         | JWT tokens or API keys. For a family setup, a shared secret may suffice.         |
| Data at rest           | SQLite encryption via **SQLCipher** (optional).                                  |
| Input validation       | Validate all fields server-side with Fastify's JSON Schema validation.           |
| Rate limiting          | `@fastify/rate-limit` plugin to prevent abuse.                                   |
| Backups                | Cron job: `cp /data/calendar.db /backups/calendar-$(date +%F).db`               |

---

## 9. Development Workflow

### Phase 1 — PWA (1–2 days)
- Add a `manifest.json` and a service worker to the existing web app.
- This gives you an installable Android "app" with offline caching immediately.

### Phase 2 — Sync Server (3–5 days)
- Set up the Fastify server on the Pi with the SQLite database.
- Implement REST endpoints + WebSocket channel.
- Add a `syncService.js` to the web app that replaces (or wraps) `storageService.js`.

### Phase 3 — React Native App (5–10 days)
- Scaffold an Expo project in the monorepo.
- Copy shared `core/` modules.
- Rewrite UI components using React Native primitives.
- Integrate AsyncStorage or SQLite for local persistence.
- Wire up the sync service.

### Phase 4 — Polish & Harden (2–3 days)
- Conflict resolution edge cases.
- Push notifications for event reminders.
- Background sync.
- Automated backups on the Pi.

---

## 10. Estimated Effort

| Task                                    | Effort      |
| --------------------------------------- | ----------- |
| PWA wrapper (service worker + manifest) | 1–2 days    |
| Raspberry Pi server (REST + WS + DB)    | 3–5 days    |
| Sync protocol (client + server)         | 2–3 days    |
| React Native app (UI rewrite)           | 5–10 days   |
| Auth, security, hardening               | 2–3 days    |
| Testing & QA                            | 2–3 days    |
| **Total**                               | **15–26 days** |

These are estimates for a **single developer** working part-time. Parallelisable tasks (server + mobile) can shrink the calendar time.

---

## 11. Alternative Approaches

### CalDAV Standard
Instead of building a custom sync protocol, you could implement the **CalDAV** standard (RFC 4791) on the Pi and use existing CalDAV clients on Android (e.g., DAVx⁵). This provides interoperability with Google Calendar, Apple Calendar, Thunderbird, etc.

- **Server:** [Radicale](https://radicale.org/) — lightweight, Python-based CalDAV server that runs well on a Pi.
- **Pros:** Standards-based; works with existing calendar apps.
- **Cons:** Less control over UX; more complex protocol; your custom web UI would need a CalDAV client library.

### Firebase / Supabase (Cloud)
If self-hosting on a Pi feels too fragile, consider **Supabase** (open-source Firebase alternative). You get a hosted PostgreSQL database, real-time subscriptions, and auth out of the box. The free tier is generous for personal use.

---

## Summary

The Calendrier codebase was designed with portability in mind:

- **Pure logic** (`utils/`, `constants/`, `hooks/`) is framework-agnostic and reusable.
- **Side-effects** (`services/`) are isolated behind a thin abstraction, making it trivial to swap localStorage for AsyncStorage, SQLite, or a remote API.
- **Styles** use CSS custom properties, so the design system's *values* transfer even when the *syntax* changes to React Native's `StyleSheet`.

Start with a **PWA** for immediate Android presence, build the **Pi sync server** next, and port to **React Native** only if native capabilities become a hard requirement.
