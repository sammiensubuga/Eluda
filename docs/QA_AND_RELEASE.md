# ELUDA QA and Release Checklist

## Per-task checks
- [ ] Acceptance criteria are explicit and testable.
- [ ] Changed files and commit SHA are recorded.
- [ ] Relevant lint/build/tests are executed; exact results are documented.
- [ ] Error, loading, empty and restricted states are checked where relevant.
- [ ] No secrets or private data are added to source control or logs.
- [ ] Responsive behaviour and keyboard interaction are checked for UI changes.
- [ ] `PROJECT_STATUS.md` and `TASK_LOG.md` are updated.

## Product-level checks before release
- [ ] Registration, login, recovery and session expiry work as specified.
- [ ] Server-side authorisation prevents unauthorised profile, match and message access.
- [ ] Contact details are not exposed without explicit consent.
- [ ] Block, report and unmatch behaviour meets approved requirements.
- [ ] Verification wording states limitations clearly.
- [ ] Account deletion and retention behaviour matches approved policy.
- [ ] Accessibility and contrast checks are completed.
- [ ] Mobile and desktop layouts are tested.
- [ ] Abuse prevention, rate limits and moderation process are reviewed.
- [ ] Backups, incident response and monitoring are defined where applicable.
- [ ] Applicable Ugandan privacy/data-protection obligations are assessed.
- [ ] Preview is verified before production release.
- [ ] Product owner explicitly approves production deployment.

## Evidence rules
Record exact command, environment, date and result. Do not report a build or test as passing unless it was run. A successful deployment alone does not establish functional or security correctness.
