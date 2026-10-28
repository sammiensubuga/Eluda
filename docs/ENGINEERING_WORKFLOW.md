# ELUDA Engineering Workflow

## Roles
### Brain
Owns product planning, requirements, system analysis, UI/UX direction, task definition, acceptance criteria and implementation review.

### Builder
Inspects the repository, implements only approved tasks, runs available checks, commits to approved feature branches, verifies previews where possible and reports evidence.

### Product owner
Approves key product, design and architecture decisions; approves production merges, production deployments and destructive production changes.

## Task handoff
Every coding task must include:
- Unique task ID and goal.
- Context and scope.
- Explicit exclusions.
- Relevant approved requirements and design references.
- Acceptance criteria.
- Files/areas likely affected, if known.
- Required checks.
- Branch and deployment restrictions.
- Any assumptions or unresolved decisions that must not be silently treated as approved.

## Required approval gates
1. **Plan before implementation.** Inspect the existing repository and relevant documentation before proposing changes.
2. **Design approval.** For user-facing work, obtain approval for the applicable screen, interaction, responsive behaviour and relevant loading, empty, error, success and restricted states before implementing them.
3. **Architecture approval.** Do not introduce or materially change frameworks, backend services, database structure, authentication, storage, real-time messaging, payment providers or other architectural commitments without approval.
4. **Scoped implementation.** Once the task is approved, implement only the agreed scope and acceptance criteria. If a new decision is needed, pause and ask rather than inventing a product rule.
5. **Review and verification.** Inspect the diff, run available checks, report evidence and known limitations. A successful build alone does not prove product correctness, security or production readiness.
6. **Release approval.** Keep work on the agreed feature branch and use preview environments for review where available. Do not merge to `main`, deploy production, modify production settings or perform destructive production/data changes without explicit approval.

## Implementation rules
1. Inspect current code, repository state and relevant docs before editing; do not assume documentation accurately describes the current implementation.
2. Do not independently alter product scope, approved UX or previously recorded decisions.
3. Do not claim unimplemented features or controls exist.
4. Keep changes focused, testable and reviewable; avoid unrelated refactors.
5. Never commit secrets or expose environment-variable values, tokens, personal data or private message content in reports.
6. Use the repository's existing conventions and available tooling unless a change is approved.
7. Run the available checks and report exact commands, outcomes and any checks not run.
8. Report changed files, commit SHA, test results, preview URL/status where available, and known limitations.
9. If requirements conflict, evidence is insufficient, access is missing or a security/privacy concern appears, stop and report the blocker before proceeding.
10. Do not run migrations against production, change production data, rotate production credentials or trigger destructive actions without explicit approval and a clear impact/rollback plan.
11. Keep product decisions separate from technical implementation details. Record unresolved items as unresolved; do not turn assumptions into decisions.
12. Treat payment integration and monetization implementation as out of scope until specifically approved.

## Evidence standard
Use these labels in reports:
- **Approved:** explicitly accepted by the product owner.
- **Proposed:** recommendation awaiting approval.
- **Implemented:** code change exists; this alone does not mean it works correctly.
- **Tested:** a named check was executed and the result recorded.
- **Verified:** directly inspected or tested, with evidence and scope stated.
- **Unverified:** not inspected or not tested.
- **Blocked:** cannot safely or correctly proceed without a decision, access or dependency.

Do not describe a feature as production-ready unless the relevant functionality, security, accessibility, responsive behaviour and release checks have evidence appropriate to the risk.

## Documentation updates
After a meaningful task, update `PROJECT_STATUS.md` and append a `TASK_LOG.md` entry. Record important approved decisions in `docs/DECISION_LOG.md`. Keep these updates factual and consistent with repository evidence; do not mark work tested or deployed without proof.
