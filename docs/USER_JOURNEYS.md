# ELUDA User Journeys

**Status:** Initial journey map; interaction details require design approval

## Journey A — Join
Welcome → registration → account verification/recovery if needed → profile setup → privacy and discovery preferences → discover.

Open decisions: supported sign-in methods, account verification method, required profile fields, and what happens when setup is incomplete.

## Journey B — Discover and connect
Discover → inspect profile → express interest or pass → mutual interest creates a match → match appears in matches list.

Open decisions: discovery ranking, limits, undo behaviour, visibility controls and how user preferences are applied.

## Journey C — Start a conversation
Match → open conversation → send and receive messages → block, report or unmatch when needed.

Requirements: only authorised participants can access a conversation; provide clear report/block controls; define abuse prevention and moderation escalation.

## Journey D — Share contact details
Conversation → user chooses to share contact details → explicit consent/confirmation → share only the selected information.

Contact sharing must never happen automatically. The exact UX and whether contact sharing is in MVP remain open.

## Journey E — Safety intervention
Profile or conversation → report or block → explain outcome and limits → prevent further unwanted interaction where specified → moderation review where applicable.

Open decisions: moderation operations, evidence retention, appeal process and response-time targets.

## Journey F — Delete account
Settings → explain consequences and retention → confirm identity/action → deactivate/delete according to approved policy → show completion and any legally required retention.

Do not promise immediate erasure until data systems, backups and applicable obligations are defined.

## Journey G — Recovery and restricted states
Login → recover account; expired session → re-authenticate; unavailable network → preserve safe user context; suspended account → explain available next steps without exposing sensitive moderation data.

## Design requirement
Map each journey to specific screens and loading, error, empty, success and restricted states in `docs/SCREEN_INVENTORY.md` and `UI_UX_SPEC.md`.
