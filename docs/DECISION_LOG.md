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
- **Decision:** Complete and review the UI/UX system design before building the main frontend feature set. Independently approved tasks may proceed without waiting for every future screen to be complete.

## DEC-005 — Visual direction
- **Status:** Proposed
- **Proposal:** Deep plum, warm ivory, rose pink and restrained gold accents.
- **Open:** Final identity, tokens, typography, iconography and component rules.

## DEC-006 — Application architecture
- **Status:** Approved direction; detailed implementation remains in progress
- **Decision:** Use Next.js and TypeScript for the application/server layer, Supabase PostgreSQL for the database, Supabase Auth for authentication, and PostgreSQL RLS plus server-side authorization to protect data. Supabase Storage is the selected direction for private profile-photo storage, subject to implementation and policy verification.
- **Decision:** Python/Django is no longer the target backend for new application features.
- **Constraint:** Legacy Django code may remain in the repository during migration. Do not assume it has been removed, is unused in deployment, or has been fully replaced. Do not delete/decommission it until replacement paths are verified and explicit approval is given.
- **Evidence boundary:** Source files and migration files do not prove that a hosted database schema, auth integration, storage policy or feature is live.
- **Open:** Exact session library/cookie configuration, full data model and RLS matrix, storage policies, realtime approach, background jobs, backup/recovery, retention and production topology.

## DEC-007 — Chat access pass model
- **Status:** Approved as the current product decision; implementation status not established
- **Decision:** The current pass options are Spark (UGX 5,000 / 24 hours), Connect (UGX 15,000 / 7 days), and Plus (UGX 30,000 / 30 days). Eluda Free is UGX 0 ongoing.
- **Decision:** An active Spark, Connect or Plus pass unlocks reading incoming messages from women and allows free replies while access is active.
- **Constraint:** Do not confuse chat access passes with VIP/VVIP profile tiers. VIP/VVIP profile tiers and paywalled profile photos are not part of the current product direction.
- **Open:** Payment provider, checkout experience, refunds, activation/expiry handling and applicable legal/compliance review remain to be decided.

## DEC-008 — Gender-specific messaging
- **Status:** Approved as the current product decision; implementation status not established
- **Women:** Can send unrestricted custom messages for free. Preset icebreakers are not required.
- **Men:** Can initiate with up to 15 free preset icebreakers per day. Sending an icebreaker does not unlock the woman's reply; reading her reply requires an active Spark, Connect or Plus pass.
- **Male Blind Lock:** Without an active pass, message content must remain inaccessible. Show this exact notice: `[Name] sent you a message. Upgrade to VIP to read it.`
- **After unlocking:** The man can read the message and reply freely. If the message includes a WhatsApp number, that content becomes visible after unlocking.
- **Security:** Enforce the lock on the server; hiding content visually is insufficient.

## DEC-009 — Casual / Hookups category rates
- **Status:** Approved as the current product decision; implementation status not established
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
- **Decision:** Do not implement payment integration or paid-pass functionality until the relevant payment and product implementation plan has been reviewed and explicitly approved. The pass model recorded in DEC-007 is a product decision, not proof of a payment integration or live purchase flow.

## DEC-013 — Production change control
- **Status:** Approved
- **Decision:** Do not merge to production, deploy production or make destructive production changes without explicit owner approval.

## Open decisions and validation
- Final brand identity and design tokens.
- Exact relationship-intention options and discovery behavior.
- Daily Picks interface and selection logic.
- Verification approach and review states.
- Full auth/session integration and RLS authorization matrix.
- Private photo storage policy and access URL lifecycle.
- Realtime delivery and background processing.
- PWA requirements and timing.
- Payment provider, checkout, pass activation/expiry, refunds and compliance.
- Moderation operations, data retention, account deletion workflow, accessibility and language support.
- Applicable Ugandan privacy and data-protection obligations before launch.
