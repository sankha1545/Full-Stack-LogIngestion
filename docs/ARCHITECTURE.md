# Architecture

## Overview

LogScope is split into three primary layers:

1. `frontend/` renders the SaaS UI for auth, application management, live logs, analytics, settings, and admin-facing flows.
2. `backend/` exposes REST endpoints, handles auth and permissions, persists data with Prisma/PostgreSQL, and emits live log events through Socket.IO.
3. `logscope-sdk/` provides a lightweight client for external applications to ship logs to the ingestion API.

## High-level flow

```text
Integrated app / SDK
        |
        v
POST /api/logs/ingest
        |
        v
Express route validation + API key lookup
        |
        v
Prisma -> PostgreSQL
        |
        +--> analytics aggregation
        |
        +--> Socket.IO room emit (app:<applicationId>)
                         |
                         v
              React live log workspace
```

## Frontend architecture

Main frontend concerns:

- `src/main.jsx`: app bootstrap, providers, routing
- `src/App.jsx`: authenticated shell and workspace layout
- `src/context/`: shared auth and theme state
- `src/pages/`: route-level pages such as dashboard, analytics, applications, and app detail
- `src/components/`: reusable UI and feature components
- `src/hooks/useLogs.js`: log fetching and live socket subscription behavior
- `src/services/socket.js`: Socket.IO client setup

## Backend architecture

Main backend entrypoint:

- `backend/server.js`

Important route groups:

- `routes/auth.js`
- `routes/oauth.js`
- `routes/apps.js`
- `routes/logs.js`
- `routes/logStats.js`
- `routes/alerts.js`
- `routes/profile.js`
- `routes/admin.js`
- `routes/search.js`
- `routes/savedViews.js`

## Data model

The Prisma schema models users, profiles, applications, members, API keys, logs, metrics, alerts, audit events, refresh tokens, trusted devices, recovery codes, and contact requests.

Core relationships:

- a `User` owns many `Application` records
- an `Application` has many `ApiKey`, `Log`, `LogMetric`, and `AlertRule` records
- `AppMember` allows shared application access
- logs are tenant-scoped by `applicationId`

## Realtime model

Socket.IO is mounted in `backend/server.js`.

Flow:

1. frontend authenticates socket using JWT
2. frontend requests `join_application`
3. backend verifies the user can access the application
4. socket joins room `app:<applicationId>`
5. ingestion route emits `new_log` into that room

## Deployment shape

Current repo-level Docker Compose:

- backend container on `3001`
- frontend Nginx proxy on `8080`
