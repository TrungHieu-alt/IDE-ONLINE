# AGENTS.md

This repo is an online judge web app.

All project docs live in `/docs`. Read `docs/progress.md` and relevant docs before doing work.

## Read First

- Read `docs/progress.md` before starting any task.
- General product behavior: `docs/requirement.md`
- Backend work: `docs/api-spec.md` and `docs/erd.md`
- Interface work: `docs/design-guide.md`

## Code Areas

- `/frontend`: React, Vite, TypeScript, Shadcn, Tailwind, Monaco
- `/backend`: NestJS, TypeScript, Jest

## Rules

- Before executing large scope tasks, provide a brief plan and ask the user for confirmation.
- Prefer vertical slices. For one feature, work on frontend and backend together when applicable.
- Do not invent API or data model behavior that conflicts with `/docs`.
- Ask clarifying questions when the request is vague, generic, or missing key constraints.
- Update docs when code changes make the docs outdated.
- After each task, update `docs/progress.md` with time, what was done, and notes if any.
