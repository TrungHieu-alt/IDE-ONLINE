# IDE-ONLINE

`IDE-ONLINE` is an online judge web application for writing code in the browser, running it in a sandboxed environment, solving programming questions, and supporting realtime collaborative viewing sessions.

The repository is organized as a PNPM workspace:

- `frontend/`: React + Vite + TypeScript UI
- `backend/`: NestJS + TypeScript API
- `docs/`: product, API, ERD, security, and progress documentation

Core product areas:

- Email/password authentication with JWT access tokens and rotating refresh tokens
- Question and test-case management
- Code run/submit flows with async execution
- Submission history
- Realtime owner-to-viewer code sharing

## Read First

Project instructions and source-of-truth docs live in `docs/`.

- `docs/progress.md`
- `docs/requirement.md`
- `docs/api-spec.md`
- `docs/erd.md`
- `docs/design-guide.md`

## Prerequisites

Recommended local environment:

- `nix develop`
- `pnpm`

The Nix dev shell includes:

- Node.js 22
- PNPM
- PostgreSQL CLI tools

## Install Dependencies

```bash
pnpm install
```

## Start PostgreSQL Locally

This repo now includes simple workspace scripts for a local Postgres data directory under `.data/postgres`.

Initialize the database cluster once:

```bash
pnpm db:init
```

Start PostgreSQL:

```bash
pnpm db:start
```

Stop PostgreSQL:

```bash
pnpm db:stop
```

Notes:

- The server uses port `5432`.
- The local Unix socket directory is `.tmp`.
- Logs are written to `.tmp/postgres.log`.
- If `.data/postgres` does not exist yet, run `pnpm db:init` first.
- `pnpm db:init` creates the cluster with a local `postgres` superuser and `trust` auth for local development.
- If you initialized the cluster before this setup was fixed, delete `.data/postgres` and run `pnpm db:init` again so the local role and socket config match the documented flow.

## Backend Database Env

Create `backend/.env` from `backend/.env.example`.

Default local connection:

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/ide_online
DATABASE_SSL=false
```

After Postgres is running, create the app database if needed:

```bash
createdb -h 127.0.0.1 -p 5432 -U postgres ide_online
```

## Run The App

Run frontend and backend together:

```bash
pnpm dev
```

Or run each app separately:

```bash
pnpm dev:frontend
pnpm dev:backend
```

## Backend DB Tooling

Drizzle commands live in `backend/`:

```bash
pnpm --dir backend db:generate
pnpm --dir backend db:migrate
pnpm --dir backend db:studio
```

## Build

```bash
pnpm build
```
