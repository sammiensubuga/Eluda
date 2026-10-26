# ELUDA Security Requirements

**Status:** Baseline requirements; implementation audit pending

## Identity and access
- Enforce authentication and authorization server-side for every private resource and state-changing action.
- Users may access only data and conversations they are authorised to see; never trust client-supplied user IDs, roles, Plan status or ownership.
- Apply least privilege to staff, moderators and automated services.
- Protect session lifecycle, password recovery, account suspension and account deletion flows.
- Require server-side checks for active Plan entitlement whenever a user attempts to read pass-gated messages. A client-side flag or previously cached entitlement is not sufficient.

## Message privacy and Plan-gated access
- When a male user has no active Plan, do not return locked message bodies or other locked message content in HTML, rendered page data, API responses, hydration state, caches or any client-accessible payload.
- The locked-message state shows only a chat bubble with a lock icon. The disabled read-only input displays `Eluda can't continue this chat on your current plan. Upgrade your plan to keep going.` with a `See Plans` button that opens the payment modal. Do not expose the message body through previews, notifications, metadata, logs delivered to clients or alternate endpoints.
- Check Plan validity and the requesting user's conversation permissions on the server before returning message content; handle expiry and concurrent requests consistently.
- Do not expose a WhatsApp number contained in a locked message through separate fields, previews or APIs; it becomes visible only once the message is unlocked.
- Enforce the approved free preset-icebreaker limit of up to 15 per day for male users server-side. Do not rely on client counters; prevent easy bypass by parallel requests, retries or account/session manipulation.
- Women may send unrestricted custom messages under the current product rules; do not impose a preset-icebreaker-only restriction on them.
- After a Plan expires, previously unlocked messages remain readable; all new incoming messages are locked.

## Input and abuse controls
- Validate all client-supplied data server-side, including profile fields, availability, Meetups category restrictions, likes, messages, reports and account settings.
- Apply appropriate rate limits and abuse detection to authentication, likes, messages, reports and other abuse-prone actions.
- Protect against injection, cross-site scripting, cross-site request forgery where relevant, insecure direct object references, mass assignment and unsafe redirects.
- Safely validate uploaded photos and restrict file type, size, storage access and processing.
- Enforce product rules on the server, including minimum profile-photo requirements and the Meetups category restrictions (no price, rate or money fields).

## Sensitive data
- Keep secrets out of source control and client-side bundles.
- Minimise logs containing personal, contact, verification or message content; restrict and protect any necessary audit records.
- Protect contact details and verification records with strict access controls. Verification status must not be represented as a guarantee of trustworthiness.
- Use secure transport and appropriate encryption for stored data based on risk and provider capabilities.
- Do not reveal phone numbers or other contact information inside locked messages before an active Plan is verified server-side.
- Define and document account-deletion, retention, backup and moderation-record handling before launch; do not promise immediate erasure of all backups unless the actual retention process supports that claim.

## Blocking, reporting and moderation
- Reporting, blocking and unmatching are intended to remain free; do not put them behind a paid Plan.
- Enforce block restrictions server-side across the interactions covered by the approved product rules, not only by hiding UI controls.
- Restrict moderator access to the minimum data needed for a case, and audit privileged access and security-relevant moderation actions where appropriate.
- Provide safeguards against report spam, retaliation and unauthorised access to reporter identity.

## Operational security
- Separate development, preview and production credentials; do not expose production secrets to untrusted preview deployments.
- Define backup, restoration, incident response and credential rotation procedures.
- Review dependencies and security advisories.
- Apply secure configuration and security headers appropriate to the chosen stack; verify access-control and cache behaviour for private responses.
- Confirm the actual architecture, identity provider, database, file storage and deployment configuration before treating any specific control as implemented.

## Required review cases
- A user cannot retrieve another user's private contact details or private profile data.
- A non-participant cannot read a conversation.
- A user without an active qualifying Plan cannot retrieve locked message bodies or embedded contact details through any endpoint or client payload.
- Plan expiry is enforced by the server, including on subsequent reads and concurrent requests.
- A blocked user cannot continue prohibited interactions as defined by product rules.
- Suspended/deleted accounts behave according to approved policy.
- The daily free preset-icebreaker limit cannot be bypassed through parallel requests or direct API calls.
- Upload validation, rate limits and abuse controls resist automated misuse.
- Private responses are not improperly exposed through shared caches, logs or analytics.
- Account deletion and retention behaviour matches the approved policy and applicable legal review.

## Status
Requirements only. Do not mark controls implemented or tested without code inspection and test evidence. These requirements do not establish that any feature or control is currently implemented.
