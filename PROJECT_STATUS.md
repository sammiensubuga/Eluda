# ELUDA Project Status

**Status:** Early build: documentation baseline reconciled, authentication implemented, onboarding in progress
**Last updated:** 2026-11-22
**Working branch:** `feat/public-access-foundation`
**Production branch:** `main`
**Production URL:** https://eluda.vercel.app

## Summary
ELUDA is a Next.js application at the repository root. The 14-table data model is applied to the Eluda dev database and email and password authentication is implemented. Onboarding is in progress; profiles, photos, messaging, Plans, payments and Discovery are not implemented. This status is a cautious baseline, not a complete repository, security or deployment audit.

## Documentation progress
- `PRODUCT_BRIEF.md`: updated to record the final stack, Plans, blind-lock messaging rules and Meetups category. Saved in commit `6c2938c0cfa01d338382b20fda7dd3539e06c0ab`.
- `docs/DECISION_LOG.md`: updated to record the current approved product decisions, security constraints, implementation gates and open questions. Saved in commit `a79244c51582ad80c2dc68734c312e9ab2743780`.
- `PROJECT_STATUS.md`: this update records the state of the documentation workflow; it does not indicate feature implementation or testing.
- Documentation was reconciled to the final rules in PR #1 (merge commit `4ef54be`); the owner reported a review of all `.md` files with no stale terms found. This is not a repository, security or deployment audit.
- `AGENTS.md`: Builder rules added below the existing Next.js agent-rules block (BLD-001).
- `docs/ENGINEERING_WORKFLOW.md`: role names updated to Brain and Builder (BLD-001).
- Status files: `TASK_LOG.md` records per-task evidence; `PROJECT_STATUS.md` records current state. There is no `PROGRESS.md`.
- BLD-001 complete: PR #3 merged into `feat/public-access-foundation` (merge commit `9faea61`).
- Branch layout: PR #7 merged `feat/public-access-foundation` into `main` (merge commit `f60b47c`). `main` now has the root-level Next.js app, and the legacy `frontend/` and `backend/` folders were removed. Tasks currently branch from `feat/public-access-foundation`. The Vercel production deployment for `f60b47c` built READY with the root-level layout, so the Vercel Root Directory is the repository root. Production branch is `main`.
- BLD-001b complete: PR #4 merged (merge commit `30085b0`); the Builder may merge a pull request under an Owner approval line in a Task Packet.
- BLD-002 complete: PR #5 merged (merge commit `5801422`); the homepage logo uses the local file with `next/image`. The homepage links now point to /sign-in and /sign-up (fixed in BLD-013).
- Hosted Supabase project "Eluda" (read-only audit, 2026-10-28): empty `public` schema, no migrations, no edge functions, no storage buckets, no Auth users. Used as the development and test database; a separate production project is planned before launch.
- Vercel env var names (names only): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and DATABASE_URL (added by the owner). SUPABASE_SECRET_KEY (server-only) is needed by BLD-015 and is added by the owner. No payment variables exist yet. Vercel deployment protection currently requires Vercel login on all *.vercel.app URLs.
- BLD-003 complete: PR #6 merged (merge commit `1611d6c`). BLD-004 and BLD-004m complete: PR #7 merged into `main` (merge commit `f60b47c`).
- Built routes (BLD-015 build): `/`, `/_not-found`, `/auth/confirm`, `/discover`, `/forgot-password`, `/onboarding`, `/reset-password`, `/sign-in`, and `/sign-up`; Discover and onboarding use partial prerendering with dynamic server-streamed content.
- Build warnings (not addressed): npm reports `eslint@9.39.5` as deprecated and one install script (`unrs-resolver`) not covered by `allowScripts`. The build succeeds.
- BLD-005 and BLD-006 series: PR #8 (merge commit `2681fc4`) and PR #9 (merge commit `b1a9c01`) merged. The data-model and authorization design is approved and committed as `docs/DATA_MODEL_AND_AUTHORIZATION.md` (design only; nothing is implemented). PRODUCT_BRIEF.md and docs/DECISION_LOG.md record the 2026-10-29 decisions.
- BLD-006c complete: PR #10 merged into `feat/public-access-foundation` (merge commit `dcf803c`); the remaining docs now match the approved decisions.
- BLD-007 complete: PR #11 merged (merge commit `0d18a54`). CI (GitHub Actions) runs lint, type-check, the client-env check, tests and build on every pull request and on pushes to `main` and `feat/public-access-foundation`. The first CI run caught a missing generated-types problem: the `typecheck` script now runs `next typegen` first.
- BLD-008 complete: PR #12 merged (merge commit `19b4fd2`). Prisma 7.10.1 with the PostgreSQL adapter is set up; `prisma generate` runs on install; `lib/db.ts` is the only place Prisma Client is created and nothing imports it yet.
- npm audit (2026-11-07): 8 moderate advisories, all in the ESLint toolchain (`eslint-config-next` to `typescript-eslint` to `minimatch`); `npm audit --omit=dev` reports 0. The suggested forced fix would downgrade `eslint-config-next` and is not applied. Revisit when `eslint-config-next` ships a fixed dependency chain. Update 2026-11-20: new advisories were published; npm audit --omit=dev reported 7 moderate advisories in next 16.4.3, addressed by BLD-012 (16.4.6), and one high-severity chain (effect, via @prisma/config, via prisma: ReDoS in Schema.TemplateLiteral) that only a Prisma downgrade would clear; that downgrade is not applied. The owner accepted this risk for now; revisit when Prisma ships a fixed effect.
- BLD-009 complete: PR #13 merged (merge commit `00478df`). Eight tables as Prisma models, with migration SQL, Row Level Security, revoked public-role access and CHECK constraints, plus a CI test that fails if a migration creates a table without RLS. Not applied to any database. The Brain applied the SQL to a scratch Postgres 16 and verified every constraint, unique rule, RLS setting and the cascade behaviour (not Supabase itself).
- BLD-010 complete: PR #14 merged (merge commit dc2bde2); the second batch of tables as Prisma models with migration SQL and Row Level Security; not applied to any database.
- Payment provider decision (2026-11-09): NylonPay replaces LivePay. Documentation updated to NylonPay in BLD-010n.
- BLD-011 complete: both migrations applied to the Eluda dev database on 2026-11-20 (read-only check by the Brain: 14 application tables, Row Level Security on for all of them, no policies, no grants to anon, authenticated or public).
- BLD-012 complete: Next.js and eslint-config-next upgraded from 16.4.3 to 16.4.6; lint, typecheck, client-env, tests and build passed, and the audit no longer lists Next.js. The owner accepted the remaining Prisma effect advisory chain for now.
- BLD-013: email and password authentication is implemented and unit-tested (64 tests across 3 files in the final BLD-013f run), and the owner tested the flows end to end on the preview including password reset. The custom email templates are in the Supabase dashboard (source of truth `docs/EMAIL_TEMPLATES.md`); the Supabase minimum password length is 10 (owner-reported).
- BLD-014: server validation now returns field-level errors for auth forms and the UI displays inline field and form feedback; action tests cover the validation and generic responses. The owner's preview check is pending.
- BLD-015: onboarding (gender, date of birth, display name, intent) with a server-side gate, under-18 blocking and a gender-immutability migration. Implemented and unit-tested (4 files, 122 tests); lint, typecheck, client-env, Prisma validation and production build passed. The migration is not applied; the owner's preview check is pending.
- Next planned work, in order: profile photos and profile basics, conversation basics, the entitlement model, the message lock with fetch-based bypass tests, real-time signals, NylonPay payments, then likes and Discovery.

## Launch blockers (not blocking the MVP build)
1. Verification for women before they can message men (method and provider open). The main abuse risk is fake-female accounts messaging men to drive paid unlocks; gender immutability does not address it.
2. Data-protection obligations and the 18+ approach.
3. Supabase Realtime plan limits (concurrent connections and message volume).
4. Production email: Gmail SMTP is for development only. Before launch, buy a domain and send through a transactional email provider (Resend is the candidate) from a verified domain.

## Previously confirmed
- Repository: `sammiensubuga/Eluda`.
- Existing feature branch: `feat/public-access-foundation`.
- Root package scripts include `dev`, `build`, `start` and `lint`.
- The previous frontend package declared Next.js 16.4.3, React 19.3.0, Tailwind CSS 4 and TypeScript 5; the application directory was subsequently moved to the repository root.
- The public welcome page is provisional; registration and login routes were not confirmed as implemented in the prior review.
- The product design and complete UI/UX specification are not yet complete.

## Status categories
| Area | Current assessment | Evidence / next verification |
|---|---|---|
| Repository | Exists | Inspect current tree and branch head |
| Public welcome page | Previously implemented | Recheck current code and preview |
| Responsive design | Intended; full audit pending | Test mobile and desktop sizes |
| Registration/login/recovery | Implemented (BLD-013, BLD-014); the owner tested sign-up, confirmation, sign-in and reset on a preview | Cross-device link opening and scanner-consumed links not yet tested |
| Profile creation/discovery | Onboarding implemented (BLD-015) and unit-tested; profile photos, profile editing and Discovery not implemented | Owner preview check of onboarding |
| Likes/matches/chat | Not confirmed implemented | Inspect routes and code |
| Privacy/safety controls | Requirements documented; implementation unverified | Audit code and tests |
| Backend/database | 14 tables with RLS applied to the Eluda dev database (BLD-011); Prisma Client first used at runtime by onboarding (BLD-015) | Gender-immutability migration written, not applied |
| Automated tests | Vitest and CI (BLD-007); auth and onboarding unit tests (4 files, 122 tests); no component rendering tests | Add tests with each feature task |
| Build/lint | CI runs lint, typecheck, client-env, tests and build on every PR (BLD-007) | Check the CI result of each PR |
| Production readiness | Not established | Security, functional, privacy and release review required |

## Outstanding work
1. Keep documents consistent with the Product Brief and Decision Log and refresh stale status text when a task changes it.
2. Complete the screen inventory and the UI/UX design system approval before large UI work.
3. Define testable acceptance criteria and release gates.
4. Decide Discovery rules (including the district list), Daily Picks logic, verification for women and data-protection obligations.
5. Implement approved tasks in small changes and update this document with evidence.

## Next task
**BLD-015** (in progress): onboarding. After it merges, the gender-immutability migration is applied to the Eluda dev database with the owner's approval, then profile photos and profile basics.

## Update rules
For every status update, distinguish:
- **Implemented:** code exists.
- **Tested:** a named test was run and its result recorded.
- **Verified in preview/production:** the deployed behaviour was checked.
- **Planned:** not implemented.
- **Unknown:** not yet inspected.

Never infer a passing test from the existence of a script or a successful deployment from a commit. Product decisions recorded in documentation do not prove that the corresponding feature exists in code.
