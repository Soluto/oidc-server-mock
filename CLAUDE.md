# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A configurable mock OIDC/OAuth2 server for development and testing, built on Duende IdentityServer. Distributed as a Docker image (`ghcr.io/soluto/oidc-server-mock`) and as a NuGet package. Configuration is entirely environment-variable-driven — no code changes are needed to change behavior.

> **License note:** Duende IdentityServer requires a paid license for production use. This project is intended for dev/test environments only.

## Commands

### TypeScript / Node.js (root workspace, pnpm)

```bash
pnpm install                                              # install all workspace dependencies
pnpm lint                                                 # ESLint on all TS files
pnpm format                                               # Prettier --write on all JS/TS/JSON/YAML/MD files
pnpm --filter e2e exec playwright install --with-deps chromium  # install Playwright browser
```

### Running Tests

Tests run against a live Docker container orchestrated by Tilt:

```bash
pnpm tilt:up    # start services + watch tests (interactive dev loop)
pnpm tilt:ci    # run tests once (CI mode)
pnpm tilt:down  # tear everything down
```

To run the Jest suite directly (requires the server already running):

```bash
cd e2e && NODE_TLS_REJECT_UNAUTHORIZED=0 npx jest --runInBand --ci
```

To run a single test file:

```bash
cd e2e && NODE_TLS_REJECT_UNAUTHORIZED=0 npx jest --runInBand --ci e2e/tests/flows/client-credentials.spec.ts
```

### .NET Backend

```bash
dotnet build src/                    # build the .NET project
dotnet run --project src/            # run locally (no Docker)
```

The .NET project has no automated unit tests — all testing is done via the E2E suite.

## Architecture

The project has two independent layers:

### Backend — `src/` (C# / .NET 8)

- **`Program.cs`** — application entry point; wires up Duende IdentityServer, Serilog, CORS, and custom middleware.
- **`Config.cs`** — reads all configuration from environment variables or mounted files (JSON or YAML). This is the authoritative source of truth for what can be configured.
- **`Controllers/`** — `HealthController` (health check), `UserController` (CRUD API for managing users at runtime).
- **`Services/`** — `ProfileService` (maps user claims into tokens), `CorsPolicyService` (dynamic CORS from config).
- **`Validation/`** — `RedirectUriValidator` (custom redirect URI matching logic).
- **`Helpers/`** — `OptionsHelper` (env-var loading), `MergeHelper` (deep-merge config objects), `AspNetServicesHelper`, `BasePathMiddleware`.
- **`JsonConverters/` + `YamlConverters/`** — custom serialization for `Claim` and `Secret` types (needed because these are not plain POCOs).

Configuration supports two delivery modes per setting: a raw value inline in the env var, or a file path pointing to a JSON/YAML file. `OptionsHelper` handles both transparently.

### E2E Tests — `e2e/` (TypeScript / Jest + Playwright)

- **`tests/`** — spec files grouped by feature: `flows/` (OAuth2 grant types), `custom-endpoints/` (user management API), `base-path.spec.ts`.
- **`helpers/`** — thin wrappers around OIDC endpoints (`authorization.ts`, `token.ts`, `introspection.ts`, `user-info.ts`). Use these in tests rather than raw `fetch`.
- **`config/`** — JSON/YAML fixtures that define the clients, users, scopes, and API resources the test server is configured with. Changing these affects which tests pass.
- **`types/`** — TypeScript interfaces for OIDC response shapes.
- **`utils/`** — JWT snapshot serializer (strips dynamic fields like `iat`/`exp` before snapshot comparison).

Jest is configured with two projects in `jest.config.ts`: `backend` (non-browser tests) and `frontend` (Playwright Chromium, for authorization-code flow).

## Key Conventions

- **TypeScript**: ESM modules (`"type": "module"`), strict mode, 120-char line width, single quotes, no parens on single-arg arrow functions (`.prettierrc`).
- **Commits**: Conventional commits enforced by commitlint + Husky. Format: `type(scope): message`.
- **Pre-commit hooks** (lint-staged): TypeScript files are type-checked (`tsc --noEmit`), ESLint-fixed, and Prettier-formatted automatically on `git commit`.
- **Snapshot tests**: JWT payloads use a custom serializer in `e2e/utils/` that strips volatile fields. When behavior changes intentionally, update snapshots with `jest --updateSnapshot`.
- **C# nullability**: Nullable annotations are enabled; avoid `!` suppression unless the null-safety is genuinely guaranteed by context.

## Local Development Flow

1. `pnpm install`
2. `pnpm --filter e2e exec playwright install --with-deps chromium`
3. `pnpm tilt:up` — Tilt builds the Docker image, starts the server with test config, and runs the E2E suite in watch mode.
4. Edit backend code in `src/` or tests in `e2e/tests/` — Tilt rebuilds/reruns automatically.
5. Before committing: `pnpm lint && pnpm format` (pre-commit hooks do this anyway).
