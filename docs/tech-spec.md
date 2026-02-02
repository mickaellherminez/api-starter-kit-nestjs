# API Starter Kit - Technical Specification

## 1. Overview

This document defines a production-ready NestJS API starter kit with:
- JWT authentication (login/register/refresh)
- OAuth (Google/GitHub)
- RBAC (roles/permissions via guards)
- Global validation and error handling
- Observability (correlation ID, structured logs, OpenTelemetry)
- Prisma as ORM
- Unit and E2E tests

Primary goals:
- Reusable template for new projects
- Clear, maintainable architecture
- Strong security and DX (developer experience)

Scope:
- Public HTTP API (REST, JSON)
- AuthN/AuthZ, observability, and testing baseline
- Prisma + PostgreSQL (default)

Out of scope (initial):
- GraphQL, WebSockets
- Multi-tenant isolation beyond RBAC
- Admin UI

## 2. Architecture

### 2.1 Modules and Responsibilities

- `AppModule`: main root module, imports all feature modules
- `AuthModule`: JWT + OAuth strategies, guards, auth service
- `UsersModule`: user CRUD and profile logic
- `RbacModule`: roles, permissions, policies, guards
- `CommonModule`: shared pipes, filters, interceptors, decorators, helpers
- `ConfigModule`: validated environment config
- `ObservabilityModule`: logging, correlationId, tracing setup
- `HealthModule`: health checks (DB, dependencies)

### 2.2 Layering Rules

- Controllers only handle HTTP concerns (DTOs, status codes, headers)
- Services contain business logic and call repositories
- No direct `req/res` usage in services
- Shared logic lives in `common`

### 2.3 Suggested Folder Structure

```
src/
  app.module.ts
  main.ts
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    dto/
    strategies/
    guards/
  users/
    users.module.ts
    users.controller.ts
    users.service.ts
    dto/
  rbac/
    rbac.module.ts
    rbac.service.ts
    guards/
    decorators/
  common/
    filters/
    interceptors/
    pipes/
    decorators/
    utils/
  config/
    config.module.ts
    config.service.ts
    env.validation.ts
  observability/
    observability.module.ts
    logger.service.ts
    tracing.ts
  health/
    health.module.ts
    health.controller.ts
prisma/
  schema.prisma
test/
  e2e/
```

## 3. Auth and RBAC

### 3.1 JWT Authentication

- Access token (short-lived)
- Refresh token (rotated, hashed in DB)
- Login and registration via `AuthController`
- Refresh endpoint rotates token and invalidates old token

Token defaults:
- Access: 10-15 minutes
- Refresh: 7-30 days
- Rotation enforced on every refresh

### 3.2 OAuth (Google/GitHub)

- Strategies using Passport
- Callback routes in `AuthController`
- OAuth user mapped to internal User entity

OAuth flow:
- `GET /v1/auth/oauth/:provider` redirects to provider
- `GET /v1/auth/oauth/:provider/callback` exchanges code, creates/links user

### 3.3 RBAC

- Roles and permissions defined in DB
- Guards:
  - `JwtAuthGuard` for authentication
  - `RolesGuard` and/or `PermissionsGuard` for access control
- Decorators:
  - `@Roles()`
  - `@Permissions()`

RBAC model:
- Role = named collection of permissions
- Permission = action + resource (e.g. `user.read`)
- Users have one or many roles

### 3.4 Security Notes

- Hash passwords with argon2 or bcrypt
- Never log PII or secrets
- Refresh tokens stored hashed and rotated
- Rate limiting on auth endpoints
- Standard security headers (helmet)
- Strict CORS policy for production

### 3.5 API Endpoints (Auth + RBAC)

Auth:
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `GET  /v1/auth/me`
- `GET  /v1/auth/oauth/google`
- `GET  /v1/auth/oauth/google/callback`
- `GET  /v1/auth/oauth/github`
- `GET  /v1/auth/oauth/github/callback`

RBAC:
- `GET  /v1/roles`
- `POST /v1/roles`
- `GET  /v1/permissions`
- `POST /v1/permissions`

## 4. Validation and Error Handling

### 4.1 Validation

- Global `ValidationPipe` with:
  - `transform: true`
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
- DTOs defined per endpoint

### 4.2 Error Handling

- Global `ExceptionFilter` enforcing uniform error format
- Standard error response:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": [],
    "traceId": "string"
  }
}
```

- Unhandled errors -> 500 with traceId

Error codes (examples):
- `AUTH_INVALID_CREDENTIALS`
- `AUTH_TOKEN_EXPIRED`
- `AUTH_FORBIDDEN`
- `VALIDATION_FAILED`
- `RESOURCE_NOT_FOUND`
- `CONFLICT`

Validation notes:
- DTOs must reflect Swagger schemas
- Custom decorators allowed for consistent validation patterns

## 5. Observability

### 5.1 Correlation ID

- Interceptor that injects correlationId into request context
- Response includes `x-correlation-id` header

### 5.2 Structured Logging

- JSON logs with standard fields:
  - `timestamp`, `level`, `message`, `context`, `correlationId`
- Sensitive fields redacted

### 5.3 OpenTelemetry

- Tracing enabled in `ObservabilityModule`
- Auto-instrumentation for HTTP + Prisma
- Exporter configured via env variables

Log schema (JSON):
```json
{
  "timestamp": "ISO-8601",
  "level": "info|warn|error",
  "message": "string",
  "context": "string",
  "correlationId": "string",
  "userId": "string",
  "route": "string",
  "durationMs": 12
}
```

PII redaction:
- Mask emails, tokens, secrets in logs

Tracing defaults:
- Trace id injected into logs
- Exporter: OTLP HTTP (default)

## 6. Testing

### 6.1 Unit Tests

- Services, guards, pipes
- Mock external dependencies

### 6.2 E2E Tests

- Supertest recommended
- Cover auth flow, RBAC, error format

E2E minimum cases:
- register/login/refresh rotation
- RBAC allow/deny
- validation errors are uniform
- correlationId present in response

## 7. Conventions

### 7.1 Naming

- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- DTOs: `*.dto.ts`
- Guards: `*.guard.ts`
- Filters: `*.filter.ts`
- Interceptors: `*.interceptor.ts`

### 7.2 Environment

- `.env` validated at startup
- Separate config for dev/test/prod

Example env variables:
- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ACCESS_TTL`
- `JWT_REFRESH_TTL`
- `OAUTH_GOOGLE_CLIENT_ID`
- `OAUTH_GOOGLE_CLIENT_SECRET`
- `OAUTH_GITHUB_CLIENT_ID`
- `OAUTH_GITHUB_CLIENT_SECRET`
- `OTEL_EXPORTER_OTLP_ENDPOINT`

### 7.3 Scripts

- `npm run start:dev`
- `npm run test`
- `npm run test:e2e`

## 8. Prisma Schema (Minimal)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String?
  roles        UserRole[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Role {
  id          String       @id @default(cuid())
  name        String       @unique
  permissions RolePermission[]
  users       UserRole[]
}

model Permission {
  id     String @id @default(cuid())
  name   String @unique
  roles  RolePermission[]
}

model UserRole {
  userId String
  roleId String
  user   User @relation(fields: [userId], references: [id])
  role   Role @relation(fields: [roleId], references: [id])
  @@id([userId, roleId])
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  @@id([roleId, permissionId])
}

model RefreshToken {
  id         String   @id @default(cuid())
  userId     String
  tokenHash  String
  expiresAt  DateTime
  revokedAt  DateTime?
  user       User     @relation(fields: [userId], references: [id])
  @@index([userId])
}
```

---

This specification is the baseline for the API Starter Kit implementation.
