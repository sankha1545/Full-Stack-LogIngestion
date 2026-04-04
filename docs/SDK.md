# SDK Guide

## Location

The repository includes a small SDK in:

```text
logscope-sdk/
```

Package metadata:

- package name: `logscope`
- entrypoint: `index.js`
- types: `types.d.ts`

## Files

- `index.js`
- `logger.js`
- `transport.js`
- `batcher.js`
- `queue.js`
- `retry.js`
- `capture.js`
- `crash.js`
- `config.js`

## Intended purpose

The SDK is meant to be embedded into an external service or app so it can:

- format logs consistently
- batch and retry sends
- submit logs to LogScope ingestion endpoints

## Integration model

1. create a LogScope application in the UI
2. copy the generated API key or connection string
3. configure the SDK in the external app
4. emit logs through the SDK
5. view them in the LogScope live app workspace

## Endpoint expectation

The backend ingestion route is:

```text
POST /api/logs/ingest
```
