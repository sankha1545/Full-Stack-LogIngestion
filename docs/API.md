# API Reference

## Base URLs

Local development:

- Backend: `http://localhost:3001`
- Frontend via Docker: `http://localhost:8080`

Most endpoints are available under `/api`.

## Health

- `GET /health`

## Authentication

Main auth routes:

- `POST /api/auth/login`
- `POST /api/auth/mfa/verify`
- `POST /api/auth/mfa/setup`
- `POST /api/auth/mfa/verify-setup`
- `POST /api/auth/mfa/disable`
- `POST /api/auth/mfa/regenerate-recovery-codes`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/password/verify`
- `POST /api/auth/password/change`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/github`
- `GET /api/auth/github/callback`

## Profile

- `GET /api/profile`
- `GET /api/profile/me`
- `PUT /api/profile`

## Applications

- `POST /api/apps`
- `GET /api/apps`
- `GET /api/apps/:id`
- `POST /api/apps/:id/rotate`
- `DELETE /api/apps/:id`

Creating an application returns a one-time API key and a connection string for ingestion.

## Logs

### `POST /api/logs/ingest`

Authentication options:

- `Authorization: Bearer <api-key>`
- `x-api-key: <api-key>`
- `?key=<api-key>`

Example payload:

```json
{
  "level": "error",
  "message": "Query timeout",
  "timestamp": "2026-04-04T10:15:00.000Z",
  "resourceId": "billing-worker",
  "traceId": "trace-123",
  "spanId": "span-456",
  "commit": "abc1234",
  "service": "billing",
  "environment": "production",
  "host": "worker-01",
  "version": "1.2.0",
  "tags": ["payments", "critical"],
  "metadata": {
    "retryCount": 2
  }
}
```

### `GET /api/logs`

Required query parameter:

- `applicationId`

Common filters:

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
- `tags`
- `page`
- `limit`

## Other route groups

- alerts: `POST /api/alerts`, `GET /api/alerts/:applicationId`
- saved views: `POST /api/saved-views`, `GET /api/saved-views`, `DELETE /api/saved-views/:id`
- search: `GET /api/search`
- admin: `GET /api/admin/users`, `GET /api/admin/users/:id`, `GET /api/admin/analytics`
- geo: `GET /api/geo/countries`, `POST /api/geo/states`
- contact: `POST /api/contact`, `GET /api/contact/:id`

## Realtime

Socket.IO path:

```text
/socket.io
```

Main live event:

- `new_log`