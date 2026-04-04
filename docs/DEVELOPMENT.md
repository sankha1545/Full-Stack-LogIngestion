# Development Guide

## Prerequisites

- Node.js 18+ or 20+
- npm
- PostgreSQL
- Docker and Docker Compose for containerized runs

## Run locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Useful backend scripts:

- `npm run dev`
- `npm start`
- `npm test`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:studio`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Useful frontend scripts:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## Run with Docker

```bash
docker compose up --build
```

Ports:

- frontend: `8080`
- backend: `3001`

## Environment variables

Minimum backend configuration:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=change-me
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
API_KEY_SECRET=change-me
```

Additional backend variables used in the project:

- `JWT_EXPIRES_IN`
- `REFRESH_TOKEN_DAYS`
- `REFRESH_TOKEN_BYTES`
- `TRUST_DEVICE_DAYS`
- `OTP_EXP_MINUTES`
- `MAX_FAILED_LOGIN`
- `ACCOUNT_LOCK_MINUTES`
- `MFA_TEMP_EXPIRY`
- `RECOVERY_CODE_COUNT`
- `MFA_ENCRYPTION_KEY`
- `LOGSCOPE_INGEST_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `REDIS_URL`

## Database

Prisma schema:

- `backend/prisma/schema.prisma`

Typical setup:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

## Testing

Backend tests:

```bash
cd backend
npm test
```

Frontend build:

```bash
cd frontend
npm run build
```

## Sample log sender

A basic PowerShell example is available at:

- `scripts/send-Logs.ps1`

Use it to verify ingestion quickly during local development.