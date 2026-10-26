# ELUDA

ELUDA is a proposed privacy-first, mobile-first dating platform for adults aged 18+ in Uganda.

> Project status: Product requirements and UI/UX are being developed incrementally. The current public welcome page is provisional. Do not assume features are implemented unless repository and test evidence confirms them.

## Documentation

- [Product brief](PRODUCT_BRIEF.md) — mission, users, product decisions and boundaries.
- [UI/UX specification](UI_UX_SPEC.md) — planned screens, design direction and interaction requirements.
- [System architecture](SYSTEM_ARCHITECTURE.md) — selected Next.js + Supabase direction, trust boundaries and migration constraints.
- [Project status](PROJECT_STATUS.md) — evidence-based implementation and verification status.
- [Task log](TASK_LOG.md) — task history, commits and test evidence.
- [Decision log](docs/DECISION_LOG.md) — approved decisions and open questions.
- [Screen inventory](docs/SCREEN_INVENTORY.md) — planned screens and status.
- [User journeys](docs/USER_JOURNEYS.md) — initial end-to-end flows.
- [Engineering workflow](docs/ENGINEERING_WORKFLOW.md) — responsibilities, approvals and implementation rules.
- [Environment setup](docs/ENVIRONMENT_SETUP.md) — local setup and safe Supabase development guidance.

## Repository structure

```text
.
├── README.md
├── PRODUCT_BRIEF.md
├── UI_UX_SPEC.md
├── SYSTEM_ARCHITECTURE.md
├── PROJECT_STATUS.md
├── TASK_LOG.md
├── docs/
├── frontend/   # Next.js / TypeScript application
└── backend/    # legacy Django code may remain during migration
```

The tree above describes intended/documented locations, not proof that every component is complete or deployed. Verify the current checkout before relying on it.

## Selected technology direction

- **Application and server layer:** Next.js + TypeScript.
- **UI:** React + Tailwind CSS.
- **Database:** Supabase PostgreSQL.
- **Authentication:** Supabase Auth, integrated with server-side session handling.
- **Authorization:** server-side checks plus PostgreSQL Row Level Security (RLS).
- **Private profile photos:** Supabase Storage direction, subject to private-bucket and policy verification.
- **Hosting:** Vercel is the current frontend hosting direction; deployment configuration and status must be verified.

Python/Django is no longer the selected target backend for new features. Legacy Django code must not be deleted or decommissioned until replacements, dependencies and data handling have been audited, verified and explicitly approved.

## Frontend development

The Next.js application is in `frontend/`. Inspect its current package scripts and lockfile before installing dependencies or running commands. Use the package manager and supported Node.js version declared by the repository. Record actual lint, type-check, build and test results; scripts existing in `package.json` do not mean they have passed.

## Product and security principles

- Adults only (18+).
- Privacy, informed consent and safety by default.
- Enforce authorization server-side; client-side UI checks are not security controls.
- Apply and test RLS on exposed Supabase tables.
- Never expose service-role/secret keys to client code.
- Never return locked message bodies before server-side authorization.
- Do not expose private contact details without the approved consent/access rules.
- Reporting, blocking and unmatching remain free.
- Verification is not a guarantee of trustworthiness.
- Do not claim a feature is implemented until code and test evidence support it.
- Assess applicable Ugandan privacy and data-protection obligations before launch.

## Development workflow

1. Read the product brief, decision log, UI/UX specification and current project status.
2. Work only on an approved task and feature branch.
3. Inspect current code, dependencies, migrations and tests before changing them.
4. Run relevant checks and report exact results.
5. Update project status and task history after meaningful work.
6. Do not merge to `main`, change production settings, apply hosted migrations, make destructive production changes or deploy to production without explicit owner approval.

## Status vocabulary

- **Approved:** explicitly accepted by the product owner.
- **Proposed/Open:** awaiting a decision.
- **Implemented:** code exists.
- **Tested:** a named check was executed and its result recorded.
- **Verified:** behavior was inspected in the stated environment.
- **Unknown:** not yet audited.

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the current evidence-based baseline.
