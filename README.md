# API Starter Kit (NestJS)

Production‑ready NestJS API starter with auth, RBAC, observability, Prisma, and tests.

## Requirements

- Node.js 20+
- npm

## Setup

```bash
npm install
```

## Environment

Create a `.env` file (see `.env.example`):

```bash
cp .env.example .env
```

## Run

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Health & Docs (planned)

- Health: `GET /v1/health`
- Swagger UI: `/docs`
- OpenAPI JSON: `/docs-json`

## Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

## Project Structure (high level)

- `src/modules/*` feature modules
- `src/common/*` cross‑cutting concerns
- `src/observability/*` logging/tracing
- `prisma/` schema and migrations
- `test/` unit + e2e

## Changelog

See `CHANGELOG.md`.
