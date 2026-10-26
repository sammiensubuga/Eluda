# ELUDA System Architecture

**Status:** Selected architecture direction; implementation and migration remain in progress  
**Last updated:** 2026-10-26

## 1. Selected architecture

ELUDA's selected application direction is:

- **Application and server layer:** Next.js with TypeScript. Use Next.js server-side capabilities for trusted application operations and authorization.
- **UI:** React and Tailwind CSS within the existing Next.js frontend in `frontend/`.
- **Database:** Supabase-hosted PostgreSQL.
- **Authentication and sessions:** Supabase Auth, integrated with Next.js using server-managed session handling appropriate to the current supported libraries.
- **Row-level data protection:** PostgreSQL Row Level Security (RLS) policies, combined with server-side authorization for protected operations.
- **Private file storage:** Supabase Storage is the selected candidate for profile-photo storage, with private buckets and authorization-controlled access; verify the actual bucket and policies before claiming it is configured.
- **Hosting:** Vercel is the existing frontend hosting direction. Verify current project settings and deployment behavior before making operational claims.

**Python/Django is no longer the selected target backend for new ELUDA application features.** The repository has contained a legacy `backend/` Django application. Its existence does not mean it is deployed or that its functionality has been migrated. Do not delete or decommission it until the replacement paths have been implemented, verified, and explicitly approved.

## 2. Migration status and evidence boundary

The selected direction is not the same as a completed migration.

- The existing repository has a Next.js frontend under `frontend/`.
- Prior repository work introduced a Supabase profile-foundation migration intended to define `public.profiles`, `public.profile_private`, ownership-oriented RLS policies, and adult-date-of-birth constraints.
- The migration's presence in source control does not prove it has been applied to the hosted Supabase project.
- At the latest recorded inspection, the hosted project had no confirmed application of that migration, and no production schema change was authorized.
- Registration/login, profile editing, discovery, messaging, moderation, storage policies, and full session integration must be individually inspected and verified before being called implemented.
- Keep the legacy Django code intact until migration and decommissioning decisions are reviewed.

## 3. Trust boundaries and authorization

- Enforce authorization on the server for every protected operation; client-side checks are presentation only.
- Apply RLS to tables in exposed schemas and test policies using realistic authenticated and unauthenticated identities.
- Combine role checks with row ownership/relationship predicates. Authentication alone does not authorize access to another user's data.
- Never expose Supabase service-role or secret keys to browser code or `NEXT_PUBLIC_*` environment variables.
- Treat public/publishable keys as identifiers, not as authorization controls; RLS and server-side checks must still protect data.
- Never return a locked message body to a client before server-side authorization confirms an active entitlement.
- Do not expose private contact details, moderation records, auth identifiers, or private profile data in public profile responses.
- Profile photos should not use permanent public URLs when intended to be private; issue access only under the approved visibility and authorization rules.
- Verification is not a guarantee of safety or trustworthiness.

## 4. Data ownership and profile foundation

The initial profile foundation is intended to separate:
- `profiles`: approved, discoverable profile attributes.
- `profile_private`: private account/profile attributes that must not be exposed through public profile reads.

The exact schema, migration state, grants, RLS policies, and generated client types must be checked against the migration and live environment before relying on them. Do not infer a live schema from a SQL file alone.

## 5. Authentication and sessions

Use Supabase Auth with Next.js server-side session handling. Before shipping auth flows, verify:
- Registration, login, logout, recovery and session refresh/expiry behavior.
- Server-side identity validation on protected routes/actions.
- Authorization behavior after account suspension, deletion, or entitlement expiry.
- Secure cookie/session configuration for the selected library versions.
- No sensitive session or auth data is logged or cached inappropriately.

Use current Supabase and Next.js documentation when implementing library-specific APIs; do not rely on outdated examples.

## 6. Storage, messaging and privacy

- Keep profile-photo storage private by default and enforce access using Storage policies and server-issued authorized access.
- Never cache private message bodies or other sensitive account data in a way that remains accessible after authorization or pass expiry.
- Locked-message responses must contain only the approved lock notice and safe metadata—not the protected body in hidden fields, HTML, JSON, logs exposed to clients, or cached payloads.
- Reporting, blocking and unmatching remain free safety controls.
- Account deletion, retention and moderation workflows must be designed and verified before launch.

## 7. Environment and operations

- Keep local, preview and production environments separate.
- Document required environment-variable names and safe placeholders only; never commit secret values.
- Verify the actual variable names against the current code and example environment files before documenting them as required.
- Use reviewed SQL migration files and disposable local databases for testing.
- Do not apply migrations to hosted Supabase, alter production settings, merge into `main`, or deploy production without explicit owner approval.
- Record migration state and test evidence separately from source-code presence.

## 8. Retiring the legacy Django backend

Django is legacy/transition scope, not the target for new features. Before decommissioning:
1. Inventory Django routes, models, permissions, serializers, jobs and dependencies.
2. Map each still-needed capability to an approved Next.js/Supabase replacement.
3. Implement and test replacements, including privacy and authorization behavior.
4. Confirm no deployed service, data store, job or workflow depends on Django.
5. Review data migration, backup, rollback and retention requirements.
6. Obtain explicit approval before deleting backend code or removing deployment resources.

## 9. Change control

- Work on an approved feature branch.
- Run relevant lint, build and tests; record exact commands and outcomes.
- Test RLS and protected flows against a disposable local database or isolated test project.
- Inspect preview behavior where permitted; a successful build alone is not proof of security or product correctness.
- Do not merge to `main`, change production settings, run destructive production migrations or deploy to production without explicit owner approval.

## 10. Architecture decisions still open

The direction is selected, but detailed decisions still require review: exact auth/session library and cookie design; complete data model and RLS matrix; photo-storage policies; realtime delivery approach; background jobs and moderation tooling; backups and recovery; retention/deletion operations; analytics/telemetry; cost limits; and production deployment topology. Payment and monetization implementation remain behind their separate approval gate.
