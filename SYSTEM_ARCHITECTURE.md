# ELUDA System Architecture

**Status:** Architecture proposal, not an implementation claim  
**Last updated:** 2026-10-25

## 1. Current evidence
- Frontend directory: `frontend/`.
- Package metadata declares Next.js, React, Tailwind CSS and TypeScript.
- Current backend, database, authentication provider, storage provider, messaging infrastructure and production secrets/configuration have not been fully audited for this document.

## 2. Proposed direction
- Frontend: Next.js, TypeScript and Tailwind CSS.
- Backend: Python with Django is a candidate.
- Database: PostgreSQL is a candidate.
- Real-time messaging: Django Channels and Redis may be considered if justified by product and operational requirements.
- Hosting/deployment: Vercel currently hosts the frontend project; backend hosting remains undecided.

These technologies are proposals until architecture decisions are explicitly approved and recorded in `docs/DECISION_LOG.md`.

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
Potential entities include User/Account, Profile, ProfilePhoto, Preference, Like, Match, Conversation, Message, ContactShareConsent, VerificationRecord, Report, Block, Notification and ModerationAction. This is a conceptual list only; fields, relationships, retention and access policies belong in `docs/DATA_MODEL.md` after requirements review.

## 6. Messaging and consent
Messaging access should be limited to permitted participants. Contact details must not be revealed without explicit consent. If real-time delivery is required, compare operational complexity and cost before adopting Channels/Redis.

## 7. Deployment and change control
- Feature work occurs on an approved feature branch.
- Run available lint/build/tests and report exact results.
- Verify preview behaviour where access permits.
- Do not merge into `main`, alter production settings, run destructive migrations or deploy production without explicit owner approval.

## 8. Decisions still required
Backend and database choice, authentication provider, photo storage, messaging design, moderation tooling, analytics/telemetry, backups, retention schedule, deployment topology and cost limits.
