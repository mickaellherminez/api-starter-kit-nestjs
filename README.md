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

## Prisma / Migrations

If you see `The table public.User does not exist`, apply the schema to your DB:

```bash
# dev with migrations
npx prisma migrate dev --name init

# or push schema without migrations
npx prisma db push
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

## Health & Docs

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

# auth register
curl -i -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"changeme"}'

# auth login
curl -i -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"changeme"}'

# auth refresh
curl -i -X POST http://localhost:3000/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'

# auth logout
curl -i -X POST http://localhost:3000/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'
```

## Auth

### Register

Request:

```json
{
  "email": "user@example.com",
  "password": "changeme"
}
```

Response:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

### Login

Request:

```json
{
  "email": "user@example.com",
  "password": "changeme"
}
```

Response:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

### Refresh

Request:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Response:

```json
{
  "accessToken": "new-jwt-access-token",
  "refreshToken": "new-jwt-refresh-token"
}
```

### Logout

Request:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Response:

```json
{
  "success": true
}
```

### Refresh rotation test (manual)

1) Create a user (get tokens):

```bash
curl -i -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"changeme"}'
```

2) Refresh with the received refresh token:

```bash
curl -i -X POST http://localhost:3000/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH_TOKEN_RECU>"}'
```

3) Retry with the old refresh token (should be rejected):

```bash
curl -i -X POST http://localhost:3000/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<ANCIEN_REFRESH_TOKEN>"}'
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
