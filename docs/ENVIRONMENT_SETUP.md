# ELUDA Environment Setup

**Status:** Initial guidance; verify against the current repository before use

## Prerequisites
- Git.
- A supported Node.js version for the current Next.js version.
- The package manager matching the committed lockfile, if present.

## Frontend
1. Clone the repository.
2. Change directory to `frontend/`.
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
