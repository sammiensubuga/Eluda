# ELUDA Product Brief

**Document status:** Working product brief — latest owner messaging rules and technical direction recorded  
**Last updated:** 2026-10-26  
**Product:** ELUDA  
**Repository:** https://github.com/sammiensubuga/Eluda

## 1. Summary

ELUDA is a privacy-first dating platform for adults across Uganda. Its mission is to help adults discover meaningful connections and communicate at their own pace. Users choose their relationship intentions.

The current monetisation model is gender-specific chat access: female users can initiate and continue messaging for free, while male users can initiate with 15 preset icebreakers daily and must have an active paid pass to read incoming messages and reply. Female users can send custom messages freely; the male recipient sees only a locked-message notice until he has an active pass.

These are intended product rules, not claims that the features or payment flows have been implemented.

## 2. Mission and product principles

**Mission:** A privacy-first dating platform where adults can discover meaningful connections and communicate at their own pace.

- Adults only (18+).
- Privacy, informed consent and safety are core product requirements.
- Mobile-first responsive web experience, supporting desktop browsers.
- Users choose their relationship intentions; precise options and discovery rules belong in the UX specification.
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

## 5. Messaging and monetisation rules

### Paid passes

| Pass | Price | Duration |
|---|---:|---|
| Spark | UGX 5,000 | 24 hours |
| Connect | UGX 15,000 | 7 days |
| Plus | UGX 30,000 | 30 days |

Eluda Free is available at UGX 0 on an ongoing basis. An active Spark, Connect or Plus pass unlocks male message reading and replies for the pass duration.

### Female messaging — unrestricted and free

- Female users can initiate contact and type custom messages freely.
- They do not need preset icebreakers to initiate contact.
- Female messaging is 100% free; no pass or payment is required to initiate, read or reply to messages.
- The male 15-icebreaker daily limit does not apply to female users.

### Male messaging — blind lock

- A male user without an active Spark, Connect or Plus pass can initiate contact using up to 15 free preset icebreakers per day.
- If a female user sends him a message and he has no active pass, the conversation remains locked.
- While locked, he must not be able to see the message text or contents. Show this exact notice: **“[Name] sent you a message. Upgrade to VIP to read it.”** Replace [Name] with the sender’s displayed name.
- The lock applies to the actual message content, not merely to the reply composer.
- Once he activates Spark, Connect or Plus, the lock is removed for the pass duration. He can read the woman’s message and reply freely.
- If a woman included her WhatsApp number in the message, it is part of the message content and becomes visible after the lock is removed. Do not invent an additional number-masking rule in this messaging flow.
- When the pass expires, male message-reading/reply access returns to the locked state according to the implemented expiry rules.

### Implementation boundary

Locked message contents must not be exposed in HTML, client state, API responses or other client-accessible payloads before an active pass is verified server-side. Hiding text visually is not sufficient. Server-side authorization and automated tests must enforce the lock.

### Removed from the current MVP direction

- VIP/VVIP profile tiers and restricted profile access.
- Blurred, locked or paywalled profile photos.
- Twin Picks as a paid or game-like feature.
- Paid priority placement and rewind.
- Paid tiers for profile viewing or discovery advantages unless the owner explicitly reopens those decisions.

Daily Picks may remain a normal Discover recommendation component; exact presentation and recommendation logic remain to be specified.

## 6. Profile categories and Casual / Hookups rates

- Profile/category selection follows gender selection during signup.
- When a woman selects the **Casual / Hookups** category, her profile must include rate fields for **Short Time** and **Overnight**.
- At least one of the two rate fields must be provided before the profile can be published in that category.
- Women can set availability to **Available**, **Busy** or **Hidden**.
- Profiles marked **Hidden** are excluded from Discovery.
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

## 8. Selected platform and technical direction

**Selected direction:** A mobile-first, responsive Next.js application using TypeScript and Tailwind CSS, with Supabase PostgreSQL as the database and Supabase Auth for authentication. Use server-side authorization together with PostgreSQL Row Level Security (RLS). Supabase Storage is the selected direction for private profile-photo storage, subject to implementation and policy verification. Vercel remains the frontend hosting direction.

**Python/Django is no longer the selected target backend for new features.** A legacy Django application has existed under `backend/`; do not assume it has been removed, is unused in deployment, or has been fully replaced. Keep it intact until the current routes, data, dependencies and deployment use are audited and replacement behavior is implemented, verified and explicitly approved.

This is an architecture decision, not a claim that the full migration is complete. The repository's Next.js frontend exists, and a Supabase profile-foundation migration has been developed in the project workflow. Source files do not prove the hosted Supabase schema is applied or that auth, storage, messaging or other product features are operational. Hosted database changes require separate explicit approval.

The Super PWA direction requires app-like mobile navigation, installability, deliberate caching, offline/reconnecting states, safe update behavior, accessibility and performance. Offline behavior must never falsely claim that a server-side operation succeeded, and private messages or account data must not remain accessible through caches after authorization expires.

## 9. Visual direction

Provisional direction: deep plum, warm ivory, rose pink and restrained gold accents. These tokens remain provisional until approved in the UI/UX review.

## 10. Decisions and open questions

### Decisions recorded

- Brand: ELUDA; audience: adults across Uganda (18+).
- Users choose their relationship intentions.
- Mobile-first responsive Next.js application using TypeScript and Tailwind CSS.
- Supabase PostgreSQL database and Supabase Auth; use server-side authorization and RLS.
- Supabase Storage is the selected direction for private profile-photo storage; actual bucket and policies require verification.
- Python/Django is not the target backend for new features; legacy code remains until replacement and decommissioning are explicitly reviewed.
- Spark: UGX 5,000 / 24 hours; Connect: UGX 15,000 / 7 days; Plus: UGX 30,000 / 30 days.
- Female users message freely, including custom messages, without paying.
- Male users get 15 preset icebreakers daily and need an active pass to read female messages or reply.
- Locked notice: “[Name] sent you a message. Upgrade to VIP to read it.”
- Male recipients can see message contents, including a WhatsApp number included in the message, after an active pass unlocks it.
- Casual / Hookups profiles for women require Short Time and Overnight rate fields, with at least one populated.
- Women can set Available, Busy or Hidden; Hidden profiles do not appear in Discovery.
- Minimum two profile photos; Discovery is for signed-in users.
- Daily Picks are a normal Discover recommendation component, not paid Twin Picks.
- VIP/VVIP profile tiers, restricted/blurred photos, priority placement and rewind are removed from the current MVP direction.
- Safety and privacy controls remain free.
- Architecture documentation does not establish that the hosted Supabase schema or full application migration is complete.

### Open questions

- Final visual identity and design tokens.
- Exact relationship-intent options and discovery/matching rules.
- Daily Picks presentation and recommendation logic.
- Exact MVP scope, launch criteria and success metrics.
- Verification method/provider and operational review process.
- Detailed Supabase Auth session/cookie integration and authorization matrix.
- Complete data model and RLS policy coverage.
- Private photo storage bucket configuration and access policy.
- Realtime messaging approach and background processing.
- PWA caching, installability, notification support and update behavior across target browsers.
- Payment provider, purchase UX, refunds, pass activation/expiry and production payment integration.
- Data-retention periods, moderation operations, languages, accessibility targets and legacy Django decommission plan.

## 11. Current implementation status

This brief records product and architecture direction; it does not certify that gender-specific message locking, pass enforcement, rate fields, full Supabase Auth integration, private storage policies or payment flow exist. Verify the repository and relevant environment before implementation or release.

**Review note:** This update records the selected Next.js + Supabase direction and keeps migration status distinct from architecture intent. The legacy Django code and hosted Supabase schema must not be assumed removed, migrated or changed without evidence.
