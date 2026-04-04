# Architecture

## Overview

LogScope has three main parts:

1. `frontend/` renders the product UI for authentication, applications, logs, analytics, and settings.
2. `backend/` provides the API, authentication, access control, ingestion, and realtime streaming.
3. `logscope-sdk/` provides a lightweight way for external services to send logs into LogScope.

## Request flow

```text
External app or SDK
        |
        v
POST /api/logs/ingest
        |
        v
API key validation
        |
        v
Prisma + PostgreSQL persistence
        |
        +--> analytics aggregation
        |
        +--> Socket.IO event to application room
                         |
                         v
                 Frontend live log view
```

## Frontend

Important areas:

- `src/main.jsx`: application bootstrap, providers, routing
- `src/App.jsx`: authenticated shell
- `src/context/`: auth, theme, and app status context
- `src/pages/`: route-level pages
- `src/components/`: reusable UI and feature components
- `src/hooks/useLogs.js`: live log fetching and subscription logic
- `src/services/socket.js`: Socket.IO client

Main user workflows:

- authentication and MFA
- application creation and credential handling
- live log viewing and filtering
- analytics and charts
- settings and profile management

## Backend

Entrypoint:

- `backend/server.js`

Main responsibilities:

- middleware setup
- route registration
- JWT and OAuth integration
- Socket.IO server setup
- application room subscriptions
- graceful shutdown

Main route groups:

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

The Prisma schema includes:

- users and profiles
- applications and members
- API keys
- logs and aggregated metrics
- alerts
- audit and auth-related records

Core relationships:

- one user can own many applications
- one application can have many logs, API keys, metrics, and alert rules
- logs are always scoped to an application

## Realtime

Socket.IO is used for live log updates.

Flow:

1. frontend authenticates the socket
2. frontend joins an application room
3. backend verifies access
4. backend emits new log events to that room during ingestion

## Deployment

Current Docker Compose setup exposes:

- backend on `3001`
- frontend Nginx proxy on `8080`