# ELUDA Environment Setup

**Status:** Initial guidance; verify against the current repository before use

## Prerequisites
- Git.
- A supported Node.js version for the current Next.js version.
- The package manager matching the committed lockfile, if present.

## Local setup
1. Clone the repository.
2. Change to the repository root; the Next.js application and package files live there.
3. Inspect the lockfile and package manager before installing dependencies.
4. Install dependencies with the matching package manager.
5. Run `npm run dev` (or the equivalent command for the lockfile's package manager).
6. Run `npm run lint` and `npm run build` before reporting changes complete.

## Environment variables
Inspect source code and example environment files to identify required variable names. Document names and purpose only; never copy secret values into documentation, issue comments or chat reports. If a variable is needed, provide a safe placeholder in examples.

## Secrets and local data
- Never commit API keys, database passwords, session secrets or production credentials.
- Use local environment files only when ignored by Git.
- Rotate any credential found in repository history or accidentally exposed.
- Do not run destructive commands against production systems during setup.

## Backend
The backend framework and local database setup have not yet been confirmed. Add backend setup steps only after architecture and repository inspection.

## Verification
This document is a starting point. Confirm prerequisites, scripts and environment variables against the current repository before treating these steps as fully tested.

## Database environment variables (names only)

Local values live in an uncommitted `.env` file and in Vercel environment settings. Never commit them or paste them into chat.

| Name | Used by | Value to use |
|---|---|---|
| `DATABASE_URL` | The running app (Prisma Client through `@prisma/adapter-pg`, created in `lib/db.ts`) | The Supabase Supavisor transaction-mode pooled connection string (port 6543, with `?pgbouncer=true`) for the dedicated `prisma` database role |
| `DIRECT_URL` | Prisma CLI commands that touch a database (migrate, db pull), through `prisma.config.ts` | The Supabase Supavisor session-mode connection string (port 5432) for the same role. The direct connection string works only on IPv6 networks or with the IPv4 add-on |

`prisma generate`, installs, CI and builds do not need these variables: `prisma.config.ts` falls back to an empty URL. Prisma commands that need a database fail until `DIRECT_URL` is set.

Prisma is pinned to 7.10.1 (stable). The `latest` npm tag currently points to an 8.0 release candidate; do not upgrade without a Task Packet. The generated client is written to `prisma/generated` (git-ignored) by `prisma generate`, which runs on `npm install` and `npm ci`.
