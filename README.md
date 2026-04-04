# LogScope

LogScope is a full-stack observability workspace for ingesting, streaming, searching, and analyzing application logs. It combines a React frontend, an Express + Prisma backend, real-time Socket.IO updates, application-scoped API keys, and a small SDK for sending logs from external services.

## What the repo contains

- Multi-page SaaS-style frontend with auth, MFA, settings, analytics, app management, live logs, and dark/light theme support
- Backend API for authentication, application management, log ingestion, log querying, alerts, saved views, admin analytics, and profile management
- PostgreSQL-backed Prisma schema for users, applications, logs, API keys, alerts, auth events, and analytics metrics
- Socket.IO-based live log streaming into the application detail experience
- Docker support for local containerized runs
- `logscope-sdk/` package for application-side log shipping

## Quick start

### Docker

From the repo root:

```bash
docker compose up --build
```

Services:

- Frontend proxy: `http://localhost:8080`
- Backend API: `http://localhost:3001`
- Health check: `http://localhost:3001/health`

### Local development

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

Typical local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Core flows

### 1. Create an application

Create an app from the UI after signing in. The backend generates:

- a one-time raw API key
- a stored hashed key
- a connection string pointing to `/api/logs/ingest`

### 2. Ingest logs

Send logs to:

```http
POST /api/logs/ingest
```

Authenticate with either:

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

### 3. Query logs

Use:

```http
GET /api/logs?applicationId=<app-id>
```

Supported filters include:

- `level`
- `search`
- `resourceId`
- `from`
- `to`
- `traceId`
- `spanId`
- `commit`
- `service`
- `environment`
- `page`
- `limit`

### 4. View live updates

After auth, the frontend connects to Socket.IO and joins application rooms. New ingested logs are emitted in real time to the matching application workspace.

## Repository structure

```text
.
├── backend/        Express API, Prisma schema, jobs, routes, auth, services
├── frontend/       React + Vite UI
├── logscope-sdk/   Lightweight JS SDK for log shipping
├── scripts/        Helper scripts such as sample log senders
├── images/         Documentation and marketing images
└── docs/           Project documentation
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [SDK Guide](docs/SDK.md)
- [Frontend Notes](frontend/README.md)

## Important environment variables

Backend commonly expects:

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
- `REFRESH_TOKEN_DAYS`
- `REFRESH_TOKEN_BYTES`
- `TRUST_DEVICE_DAYS`
- `OTP_EXP_MINUTES`

## Verification

Recent frontend verification command:

```bash
cd frontend
npm run build
```

## Notes

- `docker-compose.yml` currently exposes the frontend through Nginx on port `8080`, not `5173`
- The repo includes older files and routes in a few areas; this README documents the current active application shape rather than historical iterations