# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

## [Unreleased]

- Added user registration endpoint (POST /v1/auth/register).
- Added user login endpoint (POST /v1/auth/login).
- Added refresh token rotation (POST /v1/auth/refresh).
- Added logout endpoint (POST /v1/auth/logout).
- Added current user endpoint (GET /v1/auth/me).
- Added Google OAuth endpoints (GET /v1/auth/google, /v1/auth/google/callback).
- Added Prisma setup (schema, client, and service).
- Added dotenv loading for local environment variables.

## [0.0.1] - 2026-02-02

- Initial NestJS scaffold (CLI) added.
- Added health endpoint and correlation ID middleware.
- Added version and status endpoints.
- Added Swagger OpenAPI docs at /docs and /docs-json.
- Added Getting Started environment setup instructions.
- Added example curl requests in README.

[0.0.1]: https://github.com/mickaellherminez/api-starter-kit-nestjs/releases/tag/0.0.1
