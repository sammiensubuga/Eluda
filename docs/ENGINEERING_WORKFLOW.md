# ELUDA Engineering Workflow

## Roles
### ELUDA Product HQ
Owns product planning, requirements, system analysis, UI/UX direction, task definition, acceptance criteria and implementation review.

### ELUDA Code
Inspects the repository, implements only approved tasks, runs available checks, commits to approved feature branches, verifies previews where possible and reports evidence.

### Product owner
Approves key product/design/architecture decisions and any production merge, production deployment or destructive production change.

## Task handoff
Every coding task must include:
- Unique task ID and goal.
- Context and scope.
- Explicit exclusions.
- Relevant approved requirements/design references.
- Acceptance criteria.
- Files/areas likely affected, if known.
- Required checks.
- Branch and deployment restrictions.

## Implementation rules
1. Inspect current code before editing.
2. Do not independently alter product scope or approved UX.
3. Do not claim unimplemented features.
4. Keep changes focused and reviewable.
5. Never commit secrets or expose environment variable values in reports.
6. Run the available checks and report exact commands and outcomes.
7. Report changed files, commit SHA, test results, preview URL/status and known limitations.
8. If requirements conflict or access is missing, stop and report the blocker.
9. Do not merge into `main`, deploy production, modify production settings or perform destructive data changes without explicit approval.

## Evidence standard
Use these labels in reports:
- **Verified:** directly inspected or tested, with evidence.
- **Implemented:** code change exists.
- **Tested:** named check was executed and result recorded.
- **Unverified:** not inspected or not tested.
- **Proposed:** recommendation awaiting approval.

## Documentation updates
After a meaningful task, update `PROJECT_STATUS.md` and append a `TASK_LOG.md` entry. Record important approved decisions in `docs/DECISION_LOG.md`.
