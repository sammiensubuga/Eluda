# ELUDA Privacy and Safety Requirements

**Status:** Initial requirements; legal and operational review required  
**Last updated:** 2026-10-25

These are requirements for product design and future implementation, not proof that controls or operational processes are implemented.

## Principles
- Adult-only service; establish an appropriate age-eligibility process for users aged 18 and above.
- Collect only data needed for a defined product purpose.
- Explain why sensitive data is collected, who can access it and how long it is retained.
- Do not expose contact details without explicit, specific consent, except for content a user intentionally sends within a product flow governed by its disclosed access rules.
- Provide accessible report, block and unmatch controls.
- Verification indicates only the checks actually completed; it is not a guarantee of identity, safety or trustworthiness.
- Restrict staff access to sensitive user data and audit privileged actions where appropriate.
- Do not imply a feature, protection or operational process exists until it has been implemented and verified.

## Required user controls
- Profile visibility and discovery preferences, including women's Available, Busy and Hidden states; Hidden profiles are excluded from Discovery.
- Block and unblock controls with clearly explained effects.
- Report profile, message or conduct with a safe confirmation flow.
- Unmatch with a clear explanation of consequences.
- Account deletion request and transparent explanation of retention exceptions.
- Clear states for locked content, access expiry, errors and restrictions without leaking the content being protected.

## Message privacy and male Blind Lock
Current product decision:
- Women can send unrestricted custom messages for free; they are not required to use preset icebreakers.
- Men can initiate with up to 15 free preset icebreakers per day. Sending an icebreaker does not unlock a woman's reply.
- Without an active Spark, Connect or Plus Plan, a male user cannot read or reply to a woman's message. Show only a chat bubble with a lock icon; do not expose message text or a teaser. The disabled read-only input displays: `Eluda can't continue this chat on your current plan. Upgrade your plan to keep going.` with a `See Plans` button that opens the payment modal.
- With an active Spark, Connect or Plus Plan, he can read the message and reply freely while access remains active.
- If the message contains a WhatsApp number, it becomes visible as part of the unlocked message.

Security requirements:
- Enforce access checks server-side on every relevant read path, including APIs, realtime delivery, notification generation, previews, caches and reconnect/history requests.
- Do not send locked message bodies, attachments or equivalent sensitive content to the client in HTML, API responses, client state, push notifications or other client-accessible payloads before authorization succeeds.
- A blur, overlay, disabled button or other visual concealment is not a security control.
- Do not rely on client-side Plan state as proof of entitlement. The server must verify the active Plan and its validity.
- After a Plan expires, previously unlocked messages remain readable; all new incoming messages are locked.
- Log access/security events proportionately without unnecessarily duplicating sensitive message contents into logs.
- Test unauthorized requests, stale sessions, expired Plans, direct API calls, realtime events, notifications, caches and reconnect/history paths.

## Contact details in messages
- A WhatsApp number included in a woman's message is part of that message and is visible to the man only after the message is unlocked.
- There is no contact-sharing button, contact-sharing flow or number-masking mechanic. Do not expose contact information in notification previews, URLs, analytics or logs unnecessarily.

## Required user safety controls
- Reporting, blocking and unmatching are free safety controls.
- Reporting must not require confronting or messaging the reported person.
- Explain what happens after blocking or unmatching, including effects on discovery and conversations once those behaviors are defined.
- Avoid exposing reporter identity or report evidence to the reported user unless an approved policy and applicable obligations require disclosure.
- Define safeguards against harassment, spam, abusive messages, impersonation and repeated account abuse.

## Operational requirements
Before launch, define moderation ownership, triage severity, escalation procedures, evidence access, retention, appeals and response-time goals. Do not promise response times before staffing and process are established.
- Limit moderation access to personnel who need it for a defined purpose.
- Record privileged access and moderation actions where appropriate.
- Define processes for urgent safety reports, account restrictions and review of enforcement decisions.

## Data lifecycle
Map each personal-data category to purpose, access, retention period, deletion method and backup handling. Include profile photos, identity/verification materials if collected, messages, contact details, reports, moderation evidence, account and entitlement records, security logs and backups.
- Account deletion must not be represented as immediate full erasure until the system and applicable legal requirements support that claim.
- Define what happens to conversation records, reports, backups and legally required retention when an account is deleted.
- Collect and retain identity documents or verification data only if the chosen verification approach requires them and the collection is appropriately justified.
- Keep secrets and credentials out of source control and client bundles.

## Legal review
Assess applicable Ugandan data protection and privacy obligations, including requirements relevant to collecting, processing, securing, retaining and deleting personal data. Obtain appropriate legal advice where needed before launch. Confirm any registration, notice, consent, cross-border processing and data-subject request requirements that apply to the final service and its providers.

## Verification limitations
State what was verified, by what method and any limitations. Avoid broad badges or language implying verified users are automatically safe. Verification must not be described as a guarantee of identity, safety or trustworthiness.

## Open decisions
- Age-eligibility and account verification approach.
- Retention periods and deletion/backups behavior by data category.
- Moderation staffing, escalation, appeals and response targets.
- Exact block/unmatch behavior for existing messages and matches.
- Handling of content already viewed during a valid Plan after that Plan expires.
- Data hosting locations, provider access and cross-border processing.
- Security logging and retention policy.

## Status
These are product and security requirements, not proof that controls, payment entitlements or operational processes are implemented. Review them against the final architecture and applicable Ugandan obligations before launch.
