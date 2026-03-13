# Progress Log

Use this file as a running implementation log.

Update it after each completed task.

## Entry Template

```md
## DD/MM/YYYY

- What was done. Notes if any.
```

## Entries

## 13/03/2026

- Added PostgreSQL tooling to the Nix dev shell and backend dependencies for `drizzle-orm`, `drizzle-kit`, and `pg`.
- Added the backend database foundation for auth: Drizzle config, environment parsing, a global Postgres/Drizzle module, and schema definitions for `users` and `refresh_tokens`.
- Added root onboarding docs and local database scripts, including a project `README.md`, `backend/.env.example`, and workspace commands to initialize/start/stop local PostgreSQL.
- Updated repo hygiene for local development by ignoring generated PostgreSQL data and local startup log files.
