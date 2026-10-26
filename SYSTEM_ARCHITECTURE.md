# ELUDA System Architecture

**Status:** Architecture decision, not an implementation claim
**Last updated:** 2026-10-26

## 1. Current evidence
- The Next.js application lives at the repository root.
- Package metadata declares Next.js, React, Tailwind CSS and TypeScript.
- The repository inspection found no Prisma schema or migration files; the hosted Supabase project has not been verified against this architecture.

## 2. Selected stack
- **Application:** Next.js App Router, TypeScript and Tailwind CSS at the repository root. Next.js serves both the user interface and backend; there is no separate backend service.
- **Data access:** Prisma ORM is the only application data path. The schema belongs in `prisma/schema.prisma`, with schema changes tracked through Prisma Migrate.
- **Database:** Supabase PostgreSQL. The deployed application uses the pooled `DATABASE_URL`; Prisma Migrate uses `DIRECT_URL`. Values stay in Vercel and local environment settings, never in the repository or chat.
- **Authentication:** Supabase Auth, with server-side session validation for protected routes and actions.
- **Hosting:** Vercel hosts the application.
- **Real-time messaging:** The approach must ensure locked message content never reaches the client before active Plan authorization is verified server-side.
- **Payments:** LivePay webhooks activate Plans idempotently after authenticity verification; access is computed server-side from stored start and expiry times.

Applying any migration to the hosted Supabase database requires the owner's explicit approval. This is an architecture decision, not a claim that the components are implemented.

## 3. Architectural requirements
- Enforce authorisation on the server; never trust client-only checks.
- Keep secrets out of source control and client bundles.
- Apply least-privilege access and protect private profile/contact data.
- Validate and rate-limit authentication, discovery actions, messaging and reports.
- Record security-relevant events without logging passwords, tokens or unnecessary sensitive content.
- Design account deletion and retention before collecting real user data.
- Separate development, preview and production environments.
- Use migrations and documented backup/recovery procedures if a persistent database is introduced.

## 4. Authentication and sessions
Provider and implementation are undecided. The approved design must cover registration, login, recovery, session expiry, logout, account suspension, and protection against account enumeration and abuse. Avoid selecting a provider until requirements, cost and operational needs are reviewed.

## 5. Data model candidates
Potential entities include User/Account, Profile, ProfilePhoto, Preference, Like, Match, Conversation, Message, VerificationRecord, Report, Block, Notification and ModerationAction. This is a conceptual list only; fields, relationships, retention and access policies belong in `docs/DATA_MODEL.md` after requirements review.

## 6. Messaging and consent
Messaging access should be limited to permitted participants. A WhatsApp number typed inside a message is part of that message's content and follows the message lock. The realtime messaging approach remains open and must ensure locked message content never reaches an unauthorized client.

## 7. Deployment and change control
- Feature work occurs on an approved feature branch.
- Run available lint/build/tests and report exact results.
- Verify preview behaviour where access permits.
- Do not merge into `main`, alter production settings, run destructive migrations or deploy production without explicit owner approval.

## 8. Decisions still required
Backend and database choice, authentication provider, photo storage, messaging design, moderation tooling, analytics/telemetry, backups, retention schedule, deployment topology and cost limits.
