# Eluda

Eluda is a proposed privacy-first, mobile-first dating web application initially targeting adults in Uganda.

> Project status: UI/UX and product requirements are still being defined. The current public welcome page is provisional; do not assume unlisted product features exist.

## Documentation
- [Product brief](PRODUCT_BRIEF.md) — mission, users, boundaries and product decisions.
- [UI/UX specification](UI_UX_SPEC.md) — planned screens, design direction and interaction requirements.
- [System architecture](SYSTEM_ARCHITECTURE.md) — current evidence and proposed architecture.
- [Project status](PROJECT_STATUS.md) — completed, tested, unknown and outstanding work.
- [Task log](TASK_LOG.md) — task history, commits and test evidence.
- [Decision log](docs/DECISION_LOG.md) — approved decisions and open questions.
- [Screen inventory](docs/SCREEN_INVENTORY.md) — planned screens and status.
- [User journeys](docs/USER_JOURNEYS.md) — initial end-to-end flows.
- [Engineering workflow](docs/ENGINEERING_WORKFLOW.md) — responsibilities, approvals and implementation rules.

Additional specifications will be added under `docs/` as they are reviewed.

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
└── frontend/
```

## Current frontend
The frontend application lives in `frontend/`. Its package scripts currently include:
- `npm run dev` — local development server.
- `npm run build` — production build.
- `npm run start` — serve a built application.
- `npm run lint` — run ESLint.

Run commands from `frontend/`. A lockfile/package manager and exact Node.js version should be checked before installation. Test results must be recorded; the presence of scripts does not mean checks have passed.

## Development workflow
1. Read the product brief, decision log, UI/UX specification and current project status.
2. Work only on an approved task and feature branch.
3. Run applicable lint/build/tests and report exact results.
4. Update `PROJECT_STATUS.md` and append to `TASK_LOG.md`.
5. Do not merge to `main`, change production settings, make destructive production changes or deploy to production without explicit owner approval.

## Product principles
- Adults only (18+).
- Privacy and informed consent by default.
- Contact details are not exposed without explicit consent.
- Verification is not a guarantee of trustworthiness.
- Provide clear reporting, blocking and unmatching controls.
- Do not claim a feature is implemented until code and test evidence support the claim.
- Assess applicable Ugandan privacy and data-protection obligations before launch.

## Status vocabulary
- **Approved:** explicitly accepted by the product owner.
- **Proposed/Open:** awaiting a decision.
- **Implemented:** code exists.
- **Tested:** a named check was executed and its result recorded.
- **Verified:** behaviour was inspected in the stated environment.
- **Unknown:** not yet audited.

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the current evidence-based baseline.
