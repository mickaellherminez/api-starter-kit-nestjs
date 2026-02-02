# API Starter Kit (NestJS)

![GitHub last commit](https://img.shields.io/github/last-commit/mickaellherminez/api-starter-kit-nestjs?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/mickaellherminez/api-starter-kit-nestjs?style=flat-square)
![GitHub stars](https://img.shields.io/github/stars/mickaellherminez/api-starter-kit-nestjs?style=flat-square)

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

The app loads `.env` at startup via `dotenv`.

## Docker (PostgreSQL)

```bash
docker compose up -d
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

## Example Requests

```bash
# health
curl -i http://localhost:3000/v1/health

# version
curl -i http://localhost:3000/v1/version

# status
curl -i http://localhost:3000/v1/status
```

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
