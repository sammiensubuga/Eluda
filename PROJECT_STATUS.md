# ELUDA Project Status

**Status:** Architecture direction selected; migration and verification remain in progress  
**Last updated:** 2026-10-26  
**Documentation branch:** `docs/nextjs-supabase-architecture`  
**Working feature branch:** `feat/public-access-foundation`  
**Production branch:** `main`  
**Production URL:** https://eluda.vercel.app

## Summary

ELUDA is moving from the previously proposed Python/Django backend direction to a **Next.js + Supabase** architecture. Next.js/TypeScript is the application and server direction; Supabase PostgreSQL is the database, Supabase Auth is the authentication direction, and server-side authorization plus RLS must protect user data. Supabase Storage is the selected direction for private profile photos, pending implementation and policy verification.

This is a selected architecture direction, not proof of a completed migration. Legacy Django code has existed under `backend/` and must not be deleted or assumed unused until dependencies and deployment use are audited, replacement features are verified, and decommissioning is explicitly approved.

The repository's GitHub feature branch was at `905e87198d0a3982b49fdb02c57a82de3c216ab2` when this documentation branch was created. Three later commits exist in the Vercel sandbox but were not present on the remote feature branch at that time. This documentation work is isolated on `docs/nextjs-supabase-architecture` to avoid moving or conflicting with the existing feature branch. No changes were made to `main` or production.

## Architecture and migration status

- **Selected target:** Next.js + TypeScript + Tailwind CSS; Supabase PostgreSQL, Auth and private Storage direction.
- **Legacy backend:** Django code has existed in `backend/`; current runtime/deployment dependencies and retirement readiness require audit.
- **Profile foundation:** A Supabase migration for `public.profiles` and `public.profile_private` was developed in the project workflow. Its presence does not prove that it has been applied to hosted Supabase.
- **Hosted Supabase:** The latest recorded inspection did not confirm the profile foundation in the hosted project. No hosted migration was applied or authorized as part of this documentation update.
- **Auth/session integration:** Must be inspected and verified; do not infer it from installed dependencies or architecture docs.
- **Storage policies:** Private bucket and access policies require inspection and verification.
- **Messaging and entitlement enforcement:** Requirements are documented; implementation and security tests must be verified independently.
- **PWA:** Mobile-first Super PWA requirements remain part of product direction; installability, service worker, caching and offline behavior require code-level verification.

## Documentation updated in this branch

- `README.md`: describes the selected architecture and cautions against assuming migration completion.
- `PRODUCT_BRIEF.md`: updates platform direction and open questions.
- `SYSTEM_ARCHITECTURE.md`: records the selected target, trust boundaries, migration caveats and Django retirement gates.
- `docs/DECISION_LOG.md`: records the architecture decision.
- `docs/ENVIRONMENT_SETUP.md`: aligns local setup guidance with Next.js and safe Supabase development.

This list describes changes on `docs/nextjs-supabase-architecture`, not changes to the existing feature branch. The documentation-only branch was created from the remote `feat/public-access-foundation` state; it does not include the three later unpublished sandbox commits.

## Previously recorded repository and test evidence

Prior project work reported:
- Next.js 16.4.3, React 19.3.0, Tailwind CSS 4 and TypeScript 5 in frontend package metadata.
- A TypeScript check (`npx tsc --noEmit`) passed in the Vercel sandbox.
- A production build passed in the Vercel sandbox.
- Lint passed with one existing `<img>` performance warning in `frontend/app/page.tsx`.
- A later RLS-test rerun was not performed because `DATABASE_URL` was missing. Earlier local PostgreSQL/RLS results were reported, but they were not rerun as part of this documentation update.
- Hosted Supabase inspection did not confirm the profile tables or migration history at that time; no hosted migration was applied during this work.

These are prior reports, not tests rerun for this documentation-only change. Recheck the current branch and environment before relying on them.

## Status categories

| Area | Current assessment | Evidence / next verification |
|---|---|---|
| Repository and branches | Remote feature branch and isolated docs branch exist | Verify branch refs and commit ancestry |
| Next.js frontend | Exists | Inspect current source and package scripts |
| TypeScript/build/lint | Prior pass reports; not rerun for this docs change | Rerun on the branch that contains the code to be released |
| Supabase profile migration | Migration source reported in sandbox workflow; hosted application unverified | Inspect exact migration and migration history; test locally first |
| Supabase Auth/session | Not confirmed fully implemented | Inspect routes, server clients, cookie/session handling and tests |
| RLS | Requires fresh repeatable test | Run against a fresh disposable local PostgreSQL/Supabase environment |
| Supabase Storage | Selected direction; policies unverified | Inspect buckets, object policies and access URL behavior |
| Legacy Django | Previously present; runtime dependency unknown | Audit routes, data, deployment and jobs before decommissioning |
| PWA install/offline/update | Requirements not fully verified | Inspect manifest, service worker, caching and reconnect states |
| Product flows | Requirements documented; many features unverified | Audit code and test each flow |
| Production readiness | Not established | Functional, security, privacy, accessibility and release review required |

## Outstanding work

1. Publish/reconcile the three existing unpublished sandbox commits without rewriting their SHAs; keep this separate from the documentation branch until history is reconciled.
2. Inspect the exact Supabase profile migration and run repeatable RLS tests against a fresh disposable local database.
3. Audit Next.js authentication/session handling, server-side authorization and RLS coverage.
4. Audit private profile-photo storage and signed/access-controlled URLs.
5. Inventory legacy Django functionality and any deployment/data dependencies; plan migration before considering removal.
6. Inspect PWA manifest, service worker, cache rules, offline/reconnecting states, update handling and installability.
7. Continue product and UI/UX approval before feature work outside independently approved tasks.
8. Record test evidence and update this file after meaningful implementation work.

## Next task

**ARCH-003A verification:** Inspect the existing profile-foundation migration, then run its RLS tests against a fresh disposable local PostgreSQL/Supabase database. Do not apply the migration to hosted Supabase without explicit owner approval. Separately resolve publication of the existing sandbox commits without rewriting them.

## Update rules

For every status update, distinguish:
- **Implemented:** code exists.
- **Tested:** a named test was run and its result recorded.
- **Verified in preview/production:** deployed behavior was checked.
- **Planned:** not implemented.
- **Unknown:** not yet inspected.

Never infer a passing test from the existence of a script or a successful deployment from a commit. Product decisions recorded in documentation do not prove that the corresponding feature exists in code.
