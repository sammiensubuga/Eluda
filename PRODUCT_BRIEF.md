# ELUDA Product Brief

**Document status:** Working product brief — latest owner messaging rules recorded
**Last updated:** 2026-10-29
**Product:** ELUDA
**Repository:** https://github.com/sammiensubuga/Eluda

## 1. Summary

ELUDA is a privacy-first dating platform for adults across Uganda. Its mission is to help adults discover meaningful connections and communicate at their own pace. Users choose their relationship intentions.

The current monetisation model is gender-specific chat access: female users can initiate and continue messaging for free, while male users can send 15 preset icebreakers daily and need an active paid Plan (Spark, Connect or Plus) to read incoming messages or reply. A message sent to a man without an active Plan appears to him only as a locked chat bubble with a lock icon.

These are intended product rules, not claims that the features or payment flows have been implemented.

## 2. Mission and product principles

**Mission:** A privacy-first dating platform where adults can discover meaningful connections and communicate at their own pace.

- Adults only (18+).
- Privacy, informed consent and safety are core product requirements.
- Mobile-first responsive web experience, supporting desktop browsers.
- Users choose one relationship intent for their profile: Meetups, Dating, Marriage or Make New Friends. They can change it at any time. Discovery rules belong in the UX specification.
- Build a distinctive ELUDA identity rather than copying another dating service.
- Clearly distinguish planned, implemented and tested capabilities.
- Verification must not be presented as a guarantee of safety or trustworthiness.
- Follow the gender-specific messaging and access rules in Section 5 exactly.
- Do not restrict profile photos or create VIP/VVIP profile tiers as a monetisation mechanic.

## 3. Target users

**Target audience:** Adults aged 18+ across Uganda.

This is the selected target audience, not a claim that market demand has been validated.

## 4. Core product experience

The planned experience includes:
1. Welcome, registration, login and account recovery.
2. Gender selection during signup, with Female and Male as the available options; gender is selected before profile/connection category.
3. Profile creation and editing.
4. Profile verification with honest explanation of its limitations.
5. Discovery, full profile details and all profile photos.
6. Likes and mutual matches.
7. User-selected relationship intentions and relevant discovery controls.
8. Daily Picks: approximately 3–5 recommended profiles within Discover, not a game or paid Twin Picks entitlement.
9. Female-initiated and male-initiated messaging under Section 5.
10. Notifications and privacy/safety controls.
11. Reporting, blocking, unmatching and account deletion.

These are planned capabilities. Their implementation status must be checked in the repository.

### MVP connection rules

- Opposite-gender only: men see and message women, and women see and message men. There is no same-gender discovery or messaging, and no orientation data is collected. Gender for all rules is the gender chosen at signup; it cannot be edited afterwards (corrections are made by the owner through a reviewed script, not a feature).
- Likes and mutual matches are not required before messaging. They are an interest signal and a match badge, built after messaging and LivePay. Unmatch closes the conversation and removes the mutual like.

## 5. Messaging and monetisation rules

### Plans

| Plan | Price | Duration |
|---|---:|---|
| Spark Plan | UGX 5,000 | 24 hours |
| Connect Plan | UGX 15,000 | 7 days |
| Plus Plan | UGX 30,000 | 30 days |

Eluda Free is available at UGX 0 on an ongoing basis. An active Spark, Connect or Plus Plan unlocks male message reading and replies for the plan duration. Payments are processed through LivePay, and plan activation is confirmed by webhook.

### Female messaging: unrestricted and free

- Female users can initiate contact and type custom messages freely.
- They do not need preset icebreakers to initiate contact.
- Female messaging is 100% free; no Plan or payment is required to initiate, read or reply to messages.
- The male 15-icebreaker daily limit does not apply to female users.

### Male messaging: blind lock

- A male user without an active Plan can send up to 15 free preset icebreakers per day.
- A male user without an active Plan cannot read a woman's message and cannot reply to it.
- Locked message: if a woman messages a man who has no active Plan, the message is completely locked. No text and no teaser is shown. He sees only a chat bubble with a lock icon.
- Locked input bar: the input bar at the bottom of the chat is disabled and read-only. It shows the text "Eluda can't continue this chat on your current plan. Upgrade your plan to keep going.", with a "See Plans" button next to it that opens the payment modal.
- Once he activates a Spark, Connect or Plus Plan, the lock is removed for the plan duration. He can read the woman's messages and reply freely.
- If a woman included her WhatsApp number in a message, it is part of the message content and becomes visible once the lock is removed. There is no number-masking rule and no contact-sharing button.

### Read-only history

If a user's Plan expires, they can still scroll up and read messages that were previously unlocked. All new incoming messages are completely locked.

### Implementation boundary

Locked message contents must not be exposed in HTML, client state, API responses or any other client-accessible payload before an active Plan is verified server-side. Hiding text visually is not sufficient. Server-side authorization and automated tests must enforce the lock.

### Removed from the current MVP direction

- VIP/VVIP profile tiers and restricted profile access.
- Blurred, locked or paywalled profile photos.
- Twin Picks as a paid or game-like feature.
- Paid priority placement and rewind.
- Free message reading, contact-sharing buttons and any other paid tiers for profile viewing or discovery advantages.

## 6. Profile categories and Meetups

- Profile/category selection follows gender selection during signup.
- The relationship intents are exactly four: Meetups, Dating, Marriage and Make New Friends. A profile holds one intent and can change it at any time. Stored values: MEETUPS, DATING, MARRIAGE, FRIENDS.
- Meetups is an intent category for people who want to meet in person quickly. It has no price fields, no rates and no money inputs of any kind.
- Women can set availability to Available, Busy or Hidden. Profiles marked Hidden are excluded from Discovery.
- A Hidden woman cannot receive new conversations from anyone. Existing conversations keep working in both directions, and she can start conversations herself.
- A profile requires at least two photos.
- Only signed-in users can access Discovery.

## 7. Privacy, consent and safety

- The service is for adults aged 18+; do not design for minors.
- Keep safety and privacy controls free.
- Provide clear reporting, blocking and unmatching controls.
- Verification is not a guarantee that a person is safe or trustworthy.
- Define account-deletion behaviour and data-retention periods honestly before launch.
- Assess applicable Ugandan privacy and data-protection obligations before launch.
- The message lock is a server-side access control, not just a visual treatment.

## 8. Platform and technical direction

Selected stack: ELUDA is a mobile-first responsive web application built entirely on Next.js (App Router) with TypeScript and Tailwind CSS. Next.js serves both the user interface and the backend. Prisma is the ORM, Supabase provides the PostgreSQL database, and Vercel hosts the application. There is no separate backend service.

### Architecture rules

- Backend in Next.js: Route Handlers serve API endpoints and webhooks. Server Actions handle mutations. A server-only data-access layer is the single place application data is read and written.
- Prisma is the only application data path. The schema lives in `prisma/schema.prisma`, and schema changes are Prisma Migrate migrations committed to the repo. Applying any migration to the hosted Supabase database requires the owner's explicit approval.
- Connections: the deployed app uses Supabase's pooled connection string (`DATABASE_URL`), and Prisma Migrate uses the direct connection (`DIRECT_URL`). Values live only in Vercel and local environment settings, never in the repo or in chat.
- Authorization is enforced in server code. Prisma connects with Supabase's default database role, which does not apply Row Level Security. Every access rule, including ownership checks, Plan checks and the message lock, must therefore be implemented in the server layer and covered by automated tests.
- RLS as a backstop: Row Level Security is enabled on every table we create in the exposed schema, with no policies for the anon or authenticated roles (deny by default), and anon and authenticated privileges are revoked. This keeps Supabase's auto-generated data API from reading application tables with a public key. The single exception is a narrow, SELECT-only policy on Supabase's own `realtime.messages` table that lets an authenticated user receive Broadcast signals only on their own private channel (`user:<their user id>`); no INSERT policy exists, so clients cannot publish.
- Authentication: Supabase Auth, with session validation on the server for every protected route and action.
- Photo storage: private profile photos in Supabase Storage. Bucket configuration and access policies must be verified before use.
- Message lock: locked message content must never be selected into any API response, server-rendered output, client state or realtime channel before an active Plan is verified server-side. The realtime approach must be designed so locked content never reaches the client.
- Real-time chat (in the MVP): signal, then fetch. Private per-user Supabase Realtime channels carry only a signal (conversation ID and event type: message-arrived or entitlement-changed) and never a message body, preset key, sender name or any content-derived data. After a signal the client fetches through the normal authenticated endpoint, which applies the lock. Signals are sent server-side from a route handler after the database transaction commits. Reconnect catch-up uses a per-conversation sequence cursor plus a server-issued sync token, with a polling fallback. Full design: `docs/DATA_MODEL_AND_AUTHORIZATION.md`.
- Secrets: the server-only Supabase key never uses a `NEXT_PUBLIC_` name and never reaches the client bundle. Docs name env vars only, never values. Automated checks must fail the build if a server-only env var name appears in client code or a secret value appears in the client bundle.
- Payments: LivePay. A Route Handler receives the webhook, verifies its authenticity, activates Plans idempotently, and computes Plan access server-side from stored start and expiry times.
- The legacy `backend/` and `frontend/` directories no longer exist. The Next.js application lives at the repository root.
- PWA: app-like mobile navigation, installability, deliberate caching, offline and reconnecting states, and safe update behavior. Offline behavior must never claim a server-side operation succeeded, and private messages or account data must not remain accessible through caches after authorization expires.

This is an architecture decision, not a claim that anything is built. Source files do not prove the hosted Supabase project matches any schema.

## 9. Visual direction

Provisional direction: deep plum, warm ivory, rose pink and restrained gold accents. These tokens remain provisional until approved in the UI/UX review.

## 10. Decisions and open questions

### Decisions recorded

- Brand: ELUDA. Audience: adults across Uganda (18+). Users choose their relationship intentions.
- Stack: Next.js (App Router) for frontend and backend, Prisma ORM, Supabase PostgreSQL, Vercel. No separate backend service.
- Plans: Spark Plan UGX 5,000 / 24 hours; Connect Plan UGX 15,000 / 7 days; Plus Plan UGX 30,000 / 30 days; Eluda Free at UGX 0. Payments through LivePay, activated by webhook.
- Female users message freely, including custom messages, without paying.
- Male users without an active Plan get 15 preset icebreakers daily and cannot read or reply to a woman's message.
- Locked messages show only a chat bubble with a lock icon. The locked input bar shows the fixed upgrade text and a See Plans button that opens the payment modal.
- After a Plan expires, previously unlocked messages stay readable; new incoming messages are locked.
- Meetups is an intent category with no price, rate or money fields.
- Women can set Available, Busy or Hidden; Hidden profiles do not appear in Discovery.
- Minimum two profile photos. Discovery is for signed-in users only.
- Daily Picks are a normal Discover recommendation component.
- VIP/VVIP profile tiers, restricted or blurred photos, priority placement and rewind are removed.
- Safety and privacy controls remain free.
- Instant account deletion and webhook-driven payment activation are required.
- The Next.js application lives at the repository root; the legacy backend directory has been removed.
- Relationship intents: exactly four (Meetups, Dating, Marriage, Make New Friends); a profile holds one and can change it at any time.
- Opposite-gender only for the MVP: men see and message women, and women see and message men. No same-gender discovery or messaging, no orientation data. Gender is the gender chosen at signup and is not user-editable afterwards.
- Likes and mutual matches are not a gate for messaging and are built after messaging and LivePay. Unmatch closes the conversation and removes the mutual like.
- A Hidden woman cannot receive new conversations from anyone; existing conversations keep working and she can start conversations herself.
- Presets are for men without an active Plan only: 15 per day, resetting at midnight Africa/Kampala, and they cannot send once the other person has written. Men with an active Plan send custom messages with no daily total cap, including to start conversations. Presets are constants in code and messages store only the preset key.
- Activating a Plan unlocks every message waiting for that man; messages arriving during an active Plan unlock on arrival; each message stores an unlock time.
- Locked-message notifications carry no sender name and no text. In the signed-in conversation list, a locked conversation shows the sender's name and photo plus a lock bubble, with no text, preview, preset key or message length.
- Real-time chat is in the MVP and follows signal, then fetch (see Section 8). The single RLS policy exception is on `realtime.messages`.
- Provisional: a second Plan purchase starts when the current Plan ends. Account deletion makes the account inaccessible instantly, then purges personal data and photos; payment records are kept but detached from personal data. Moderator access to message content is deferred.
- Launch blockers (not blocking the MVP build): verification for women before they can message men; data-protection obligations and the 18+ approach; Supabase Realtime plan limits.

### Open questions

- Final visual identity and design tokens.
- Discovery and recommendation rules (relationship-intent options are decided; likes and matches are not a messaging gate).
- Daily Picks presentation and recommendation logic.
- Exact MVP scope, launch criteria and success metrics.
- Verification method/provider and operational review process. Launch blocker: women must be verified before they can message men (method and provider open).
- Supabase Realtime plan limits (concurrent connections and message volume) to be checked before launch.
- Prisma schema implementation: the data model and authorization matrix are approved as a design in `docs/DATA_MODEL_AND_AUTHORIZATION.md`; nothing is implemented.
- Private photo bucket configuration and access policy.
- PWA caching, installability and notification support across target browsers.
- Refunds. Plan stacking is provisional: a second purchase starts when the current Plan ends; revisit in the LivePay task.
- Data-retention periods, moderation operations (moderator access to message content is deferred), languages and accessibility targets. Account deletion is provisional: the account becomes inaccessible instantly, then personal data and photos are purged; payment records are kept but detached from personal data.

## 11. Current implementation status

This brief records product and architecture direction. It does not certify that message locking, Plan enforcement, Prisma schema, authentication, storage policies or payment flow exist. A repository inspection on 2026-10-26 found a Next.js application at the repository root and no Prisma schema or migration files. Verify the repository and the hosted Supabase project before implementation.

**Review note:** This update records the final stack (Next.js + Prisma + Supabase + Vercel), the final Plans and blind-lock messaging rules, and the Meetups category. The 2026-10-29 update adds the four relationship intents, the opposite-gender rule, the Hidden-woman rule, the real-time signal-then-fetch design and the approved data-model decisions. Other project documents were reconciled in the same change.
