# ELUDA User Journeys

**Status:** Initial journey map; interaction details require design approval  
**Last updated:** 2026-10-25

These journeys describe intended product behavior. They are not evidence that the screens or features are implemented.

## Journey A — Join
Welcome → registration → select Female or Male → select connection category → account verification/recovery if needed → profile setup and required profile photos → privacy and discovery preferences → Discover.

Requirements:
- Gender selection happens before connection-category selection.
- Profiles require at least two photos.
- Users must be adults aged 18 and above.
- Discover is available only to signed-in users.

Open decisions: supported sign-in methods, account verification method, required profile fields beyond confirmed requirements, and what happens when setup is incomplete.

## Journey B — Discover and connect
Signed-in Discover → inspect profile → express interest or pass → mutual interest creates a match → match appears in matches list → open conversation.

Requirements:
- Women's availability can be Available, Busy or Hidden; Hidden profiles are excluded from Discover.
- Daily Picks is currently envisioned as approximately 3–5 recommended profiles. Its presentation and selection logic remain open.
- Meetups is an intent category for people who want to meet in person quickly; it has no price, rate or money fields.
- Verification indicators must not imply a guarantee of trustworthiness.

Open decisions: discovery ranking, limits, undo behavior, visibility controls and how user preferences are applied.

## Journey C — Women initiate or reply
Woman opens a profile or conversation entry point → composes an unrestricted custom message → sends it without needing a preset icebreaker → continues messaging.

Requirements:
- Messaging is free for women.
- Women can write custom messages freely; preset icebreakers are not required.
- Message contents, including a WhatsApp number, are handled according to the recipient's access and privacy rules.

The exact point at which a conversation can begin relative to matching remains to be finalized in the interaction design; do not silently invent a match requirement if the approved product flow differs.

## Journey D — Men initiate with a preset icebreaker
Man browses a profile → chooses one of the available preset icebreakers → sends it within the allowance of up to 15 free icebreakers per day → waits for a response.

Requirements:
- Men have up to 15 free preset icebreakers per day to initiate.
- Sending an icebreaker does not unlock the woman's reply.
- Daily allowance counting, reset timezone, and handling of failed sends require implementation acceptance criteria.

## Journey E — Male Blind Lock and Plan unlock
Woman sends a message to a man → server checks whether the man has an active Spark, Connect or Plus Plan.

**If no active Plan:**
- Show only a chat bubble with a lock icon; do not expose message text or a teaser. The disabled read-only input displays: `Eluda can't continue this chat on your current plan. Upgrade your plan to keep going.` and a `See Plans` button opens the payment modal.
- Do not reveal the message body in HTML, client state, API responses, notifications or any other client-accessible payload.
- Offer the approved Plan information/upgrade path, without claiming a purchase succeeded.

**If an active Plan is confirmed:**
- Allow the man to read the message and reply freely while the Plan remains active.
- If the message contains a WhatsApp number, it becomes visible as part of the unlocked message.
- If the Plan expires, enforce the resulting access state server-side and explain the state clearly.

Current Plan decisions:
- Spark: UGX 5,000 / 24 hours.
- Connect: UGX 15,000 / 7 days.
- Plus: UGX 30,000 / 30 days.
- Eluda Free: UGX 0 ongoing.

These are product decisions, not proof of live payment, checkout or entitlement functionality. Payment provider, checkout, refunds, activation and expiry details require further approval. Chat Plans are distinct from VIP/VVIP profile tiers; VIP/VVIP profile tiers and paywalled profile photos are not in the current product direction.

## Journey F — Share contact details
Conversation → user chooses to share contact details → explicit consent/confirmation → share only the selected information.

Contact sharing must never happen automatically. The exact UX and whether a separate contact-sharing flow is in MVP remain open. A WhatsApp number written inside a message follows the Blind Lock rules above and is visible to the man only after that message is unlocked.

## Journey G — Safety intervention
Profile or conversation → report or block → explain outcome and limits → prevent further unwanted interaction where specified → moderation review where applicable.

Requirements:
- Reporting, blocking and unmatching are free safety controls.
- Provide clear controls and feedback.
- Verification is not a guarantee of safety or trustworthiness.

Open decisions: moderation operations, evidence retention, appeal process and response-time targets.

## Journey H — Delete account
Settings → explain consequences and retention → confirm identity/action → deactivate/delete according to approved policy → show completion and any legally required retention.

Do not promise immediate erasure until data systems, backups and applicable obligations are defined.

## Journey I — Recovery and restricted states
Login → recover account; expired session → re-authenticate; unavailable network → preserve safe user context; suspended account → explain available next steps without exposing sensitive moderation data.

Include incomplete profile, empty Discover, no matches, message send failure, locked message, expired Plan, failed/pending purchase if purchases are later approved, and session-expired states where relevant.

## Design requirement
Map each journey to specific screens and loading, error, empty, success and restricted states in `docs/SCREEN_INVENTORY.md` and `UI_UX_SPEC.md`. Obtain owner approval for the journey and screen design before frontend implementation.
