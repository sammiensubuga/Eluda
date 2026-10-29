# ELUDA Decision Log

**Purpose:** Single record of important product, design, architecture and release decisions.

Statuses: **Approved**, **Proposed**, **Open**, **Superseded**. Only the product owner can approve key product and production decisions. This log records decisions; it does not claim that features are implemented.

## DEC-001 — Initial audience and market
- **Status:** Approved
- **Decision:** ELUDA initially targets adults aged 18 and above in Uganda.
- **Notes:** User research and segmentation remain to be validated.

## DEC-002 — Adult-only service
- **Status:** Approved
- **Decision:** The service is intended for adults aged 18 and above.

## DEC-003 — Privacy and consent
- **Status:** Approved
- **Decision:** Privacy, informed consent, contact-sharing control, reporting and blocking are foundational requirements.
- **Security requirement:** Sensitive or locked content must not be exposed in HTML, client state, API responses or other client-accessible payloads before server-side authorization succeeds.
- **Caveat:** Profile verification must not be presented as a guarantee of safety or trustworthiness.

## DEC-004 — UI/UX before feature implementation
- **Status:** Approved
- **Decision:** Complete and review the UI/UX system design before building the main frontend feature set.

## DEC-005 — Visual direction
- **Status:** Proposed
- **Proposal:** Deep plum, warm ivory, rose pink and restrained gold accents.
- **Open:** Final identity, tokens, typography, iconography and component rules.

## DEC-006 — Technical stack
- **Status:** Superseded 2026-10-26
- **Historical proposal:** Next.js/TypeScript/Tailwind frontend; Django and PostgreSQL backend; Django Channels/Redis if justified.
- **Disposition:** Superseded by the final stack decision recorded below. The proposal is retained as history, not as current direction.

## DEC-007 — Chat access pass model
- **Status:** Superseded 2026-10-26; historical wording retained for decision history
- **Disposition:** See “Final stack and product rules (2026-10-26)” below for current Plan terminology and rules.
- **Decision:** The current pass options are Spark (UGX 5,000 / 24 hours), Connect (UGX 15,000 / 7 days), and Plus (UGX 30,000 / 30 days). Eluda Free is UGX 0 ongoing.
- **Decision:** An active Spark, Connect or Plus pass unlocks reading incoming messages from women and allows free replies while access is active.
- **Constraint:** Do not confuse chat access passes with VIP/VVIP profile tiers. VIP/VVIP profile tiers and paywalled profile photos are not part of the current product direction.
- **Open:** Payment provider, checkout experience, refunds, activation/expiry handling and applicable legal/compliance review remain to be decided.

## DEC-008 — Gender-specific messaging
- **Status:** Superseded 2026-10-26; historical wording retained for decision history
- **Disposition:** See “Final stack and product rules (2026-10-26)” below for current blind-lock behavior and fixed input-bar notice.
- **Women:** Can send unrestricted custom messages for free. Preset icebreakers are not required.
- **Men:** Can initiate with up to 15 free preset icebreakers per day. Sending an icebreaker does not unlock the woman's reply; reading her reply requires an active Spark, Connect or Plus pass.
- **Male Blind Lock:** Without an active pass, message content must remain inaccessible. Show this exact notice: `[Name] sent you a message. Upgrade to VIP to read it.`
- **After unlocking:** The man can read the message and reply freely. If the message includes a WhatsApp number, that content becomes visible after unlocking.
- **Security:** Enforce the lock on the server; hiding content visually is insufficient.

## DEC-009 — Casual / Hookups category rates
- **Status:** Superseded 2026-10-26; historical wording retained for decision history
- **Disposition:** The current Meetups category has no price, rate or money fields; see the final dated decision below.
- **Decision:** For women publishing in the Casual / Hookups category, provide Short Time and Overnight rate fields.
- **Validation:** At least one of the two rate fields must be completed to publish in this category.

## DEC-010 — Profile and discovery rules
- **Status:** Approved as the current product decision; implementation status not established
- Gender selection at signup is Female or Male and occurs before choosing a connection category.
- Users must be signed in to use Discovery.
- Profiles require at least two photos.
- Women can set availability to Available, Busy or Hidden. Hidden profiles are excluded from Discovery.
- Daily Picks is envisioned as approximately 3–5 recommended profiles in Discover; detailed UI and selection logic remain open.

## DEC-011 — Safety controls and profile tiers
- **Status:** Approved
- **Decision:** Reporting, blocking and unmatching are free safety controls.
- **Decision:** Do not add VIP/VVIP profile tiers, paywalled or blurred profile photos, paid priority placement, rewind, or paid profile-viewing/discovery perks unless the product owner explicitly reopens those decisions.

## DEC-012 — Monetisation implementation gate
- **Status:** Approved
- **Decision:** Do not implement payment integration or paid-Plan functionality until the relevant payment and product implementation plan has been reviewed and explicitly approved. The Plan model recorded in DEC-007 is a product decision, not proof of a payment integration or live purchase flow.

## DEC-013 — Production change control
- **Status:** Approved
- **Decision:** Do not merge to production, deploy production or make destructive production changes without explicit owner approval.

## Open decisions and validation
- Final brand identity and design tokens.
- Discovery behavior and matching rules (the relationship-intent options are decided; see the 2026-10-29 section below).
- Daily Picks interface and selection logic.
- Verification approach and review states.
- Authentication sign-in method, storage configuration and final real-time details (the signal-then-fetch design is approved; see the 2026-10-29 section below).
- PWA scope and timing.
- Payment provider, checkout, Plan activation/expiry, refunds and compliance.
- Moderation operations, data retention, account deletion workflow, accessibility and language support.
- Applicable Ugandan privacy and data-protection obligations before launch.


## Final stack and product rules (2026-10-26)
- **Status:** Approved product and architecture direction; implementation status unverified
- No contact-sharing button or flow exists; a WhatsApp number typed in a message is part of that message and follows the message lock.
- **Audience:** ELUDA serves adults aged 18 and above across Uganda; users choose their relationship intentions.
- **Stack:** Next.js App Router for frontend and backend, TypeScript, Tailwind CSS, Prisma ORM, Supabase PostgreSQL and Vercel hosting. There is no separate backend service; the Next.js application lives at the repository root.
- **Plans:** Spark Plan UGX 5,000 / 24 hours; Connect Plan UGX 15,000 / 7 days; Plus Plan UGX 30,000 / 30 days; Eluda Free at UGX 0. Payments use LivePay and activation is webhook-driven.
- **Female messaging:** Female users can initiate contact and send custom messages freely, without a Plan or payment.
- **Male messaging:** Male users without an active Plan can send 15 preset icebreakers per day and cannot read or reply to a woman's message.
- **Blind lock:** Locked messages show only a chat bubble with a lock icon. The disabled input displays the fixed upgrade text and a See Plans button that opens the payment modal. Locked content must not reach client-accessible payloads before server-side Plan authorization.
- **Expiry:** Previously unlocked messages remain readable after a Plan expires; new incoming messages are locked.
- **Meetups:** Meetups is an intent category without price, rate or money fields.
- **Availability and discovery:** Women can set Available, Busy or Hidden; Hidden profiles are excluded from Discovery. Profiles require at least two photos. Discovery is for signed-in users only. Daily Picks are part of ordinary Discover recommendations.
- **Removed direction:** VIP/VVIP profile tiers, restricted or blurred photos, priority placement and rewind are removed. Reporting, blocking and unmatching remain free.
- **Required capabilities:** Instant account deletion and webhook-driven payment activation are requirements, not claims of implementation.
- **Open items:** Final visual identity and design tokens; discovery and recommendation rules and Daily Picks presentation and logic; MVP launch criteria and success metrics; verification provider and review process (launch blocker: women must be verified before they can message men); authentication sign-in method; refunds; private photo bucket configuration and access policy; PWA caching, installability and browser notification support; retention and deletion details, moderation operations (including moderator access to message content, deferred), languages and accessibility targets; Supabase Realtime plan limits before launch.

## Data model, realtime and messaging decisions (2026-10-29)
- **Status:** Approved product and architecture direction; items marked provisional may be revisited; implementation status unverified. Full design: `docs/DATA_MODEL_AND_AUTHORIZATION.md`.
- **Relationship intents:** exactly four (Meetups, Dating, Marriage, Make New Friends), stored as MEETUPS, DATING, MARRIAGE, FRIENDS. A profile holds one and can change it at any time. Meetups has no price, rate or money fields and no extra features.
- **Opposite-gender only (MVP):** men see and message women, and women see and message men. No same-gender discovery or messaging and no orientation data. Gender is the gender chosen at signup and is not user-editable afterwards; corrections are made by the owner through a reviewed script.
- **Likes and matches:** not a gate for messaging; built after messaging and LivePay; the `likes` table stays in the schema. Unmatch closes the conversation and removes the mutual like.
- **Hidden:** a Hidden woman cannot receive new conversations from anyone; existing conversations keep working; she can start conversations herself.
- **Presets:** only men without an active Plan send presets (15 per day, resetting at midnight Africa/Kampala) and they cannot send once the other person has written. Men with an active Plan send custom messages with no daily total cap, including to start conversations. Presets are constants in code; messages store only the preset key.
- **Unlock:** activating a Plan unlocks every message waiting for that man; messages arriving during an active Plan unlock on arrival; each message stores an unlock time; unlocked messages stay readable after expiry; messages arriving after expiry stay locked.
- **Notifications and list:** locked-message notifications carry no sender name and no text. In the signed-in conversation list a locked conversation shows the sender's name and photo plus a lock bubble, with no text, preview, preset key or message length.
- **Real-time chat (MVP):** signal, then fetch, over private per-user Supabase Realtime channels. Signals carry only a conversation ID and an event type. The single RLS policy exception is a SELECT-only policy on `realtime.messages` for the user's own channel; clients cannot publish. The server-only Supabase key never uses a `NEXT_PUBLIC_` name; CI checks enforce this.
- **Build order:** message lock with fetch-based bypass tests first, then real-time signals, then LivePay (which adds the entitlement-changed signal).
- **Provisional:** a second Plan purchase starts when the current Plan ends; account deletion makes the account inaccessible instantly, then purges personal data and photos, with payment records kept but detached from personal data; moderator access to message content is deferred.
- **Launch blockers (not blocking the MVP build):** verification for women before they can message men (method and provider open); data-protection obligations and the 18+ approach; Supabase Realtime plan limits.
