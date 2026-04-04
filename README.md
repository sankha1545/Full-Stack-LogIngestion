# LogScope

LogScope is a full-stack log observability platform. It lets teams create applications, generate ingestion credentials, send structured logs, stream them live, search them, and analyze them from a web UI.

## Features

- Authentication with login, signup, MFA, and OAuth support
- Application management with one-time API key generation and key rotation
- Structured log ingestion through `/api/logs/ingest`
- Live log streaming with Socket.IO
- Search, filtering, analytics, alerts, and saved views
- Settings, profile, security, notification, and theme preferences
- Docker-based local setup and a lightweight SDK for external apps

## Project structure

```text
backend/        Express API, Prisma schema, auth, routes, jobs, services
frontend/       React + Vite application
logscope-sdk/   SDK for sending logs to LogScope
scripts/        Local helper scripts
images/         Screenshots and static assets
docs/           Project documentation
```

## Quick start

### Run with Docker

```bash
docker compose up --build
```

Default ports:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3001`
- Health check: `http://localhost:3001/health`

### Run locally

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Local development URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Basic usage

### 1. Create an application

Sign in to LogScope and create an application from the Applications page. The backend returns:

- a one-time raw API key
- a hashed stored key
- a connection string for ingestion

### 2. Send logs

Send logs to:

```http
POST /api/logs/ingest
```

You can authenticate with:

- `Authorization: Bearer <api-key>`
- `x-api-key: <api-key>`
- `?key=<api-key>`

Example payload:

```json
{
  "level": "error",
  "message": "Database connection failed",
  "timestamp": "2026-04-04T10:15:00.000Z",
  "resourceId": "auth-service",
  "traceId": "trace-123",
  "spanId": "span-456",
  "service": "api",
  "environment": "production",
  "host": "node-1",
  "version": "1.4.2",
  "tags": ["payments", "critical"],
  "metadata": {
    "region": "ap-south-1"
  }
}
```

### 3. View and filter logs

Use the application detail page to:

- tail live logs
- search messages
- filter by level, resource, service, trace, and date range
- inspect structured metadata

### 4. Analyze activity

Use the Analytics page to review volume trends, severity breakdowns, and event patterns for each application.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [SDK Guide](docs/SDK.md)
- [Frontend Guide](frontend/README.md)

## Important environment variables

Common backend variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `BACKEND_URL`
- `API_KEY_SECRET`
- `MFA_ENCRYPTION_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `LOGSCOPE_INGEST_URL`

## Verification

Frontend production build:

```bash
cd frontend
npm run build
```

Backend tests:

```bash
cd backend
npm test
```