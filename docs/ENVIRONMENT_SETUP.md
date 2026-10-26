# ELUDA Environment Setup

**Status:** Initial guidance aligned to the selected Next.js + Supabase direction; verify against the current checkout before use  
**Last updated:** 2026-10-26

## Prerequisites

- Git.
- A Node.js version supported by the Next.js version declared in `frontend/package.json`.
- The package manager matching the committed lockfile.
- Access to a development Supabase project only when a task requires it.
- PostgreSQL tooling for local database/RLS tests when required by the task.

Do not connect development work to production credentials by default.

## Next.js application

1. Clone the repository and check out the approved feature branch.
2. Change directory to `frontend/`.
3. Inspect `package.json`, the committed lockfile and any example environment file.
4. Install dependencies using the package manager that matches the lockfile.
5. Inspect the source to identify the actual environment-variable names and required services.
6. Start the development server using the declared package script.
7. Run the available lint, type-check, build and test scripts relevant to the change; record the actual results.

Do not assume a script or environment variable exists just because it is common in Next.js projects.

## Supabase development setup

- Use a dedicated development project or disposable local Supabase/PostgreSQL environment for schema and RLS testing.
- Inspect the current migration files and migration history before applying anything.
- Test RLS with separate anonymous and authenticated identities, including cross-user access attempts.
- Confirm table grants and RLS policies together; RLS does not itself expose a table through the Data API.
- Keep Supabase service-role/secret keys server-only. Never place them in a `NEXT_PUBLIC_*` variable or browser bundle.
- Do not apply migrations to the hosted ELUDA project unless the owner explicitly approves that exact change.
- A migration file in the repository does not prove that it has been applied to any hosted project.

## Environment variables and secrets

Inspect the current source and example environment files before listing variable names. Document names and purpose only, with safe placeholders; never put actual secrets, access tokens, database passwords or production values in documentation, issues or chat.

- Keep local environment files out of Git when they contain credentials.
- Use separate credentials for local, preview and production environments.
- Never expose service-role/secret keys to the browser.
- If a credential is found exposed in tracked files or history, report the exposure and follow the approved rotation/remediation process; do not rewrite history or change production credentials without approval.

## Legacy Django backend

A legacy `backend/` Django application has existed in the repository. It is not the selected target for new features. Do not assume it has been removed, is unused in any deployment, or has been fully migrated. Its setup and retirement steps must be based on a current repository/deployment audit and explicit approval.

## Verification and change control

This document is guidance, not evidence that setup has been tested end to end. Record the environment used, exact commands and results. Never run destructive commands against a hosted or production system during setup. Do not merge to `main`, change production settings, apply hosted migrations or deploy production without explicit owner approval.
