# ELUDA Product Brief

**Document status:** Working product brief — prior product decisions restored; remaining items marked open  
**Last updated:** 2026-10-25  
**Product:** ELUDA  
**Repository:** https://github.com/sammiensubuga/Eluda

## 1. Summary

ELUDA is a privacy-first dating platform for adults across Uganda. Its mission is to help adults discover meaningful connections and communicate at their own pace. Users choose their relationship intentions.

The selected monetisation direction is chat-focused: everyone can browse profiles and view all profile photos, while a time-limited paid pass unlocks reading replies, sending custom messages and ongoing chat. Paid access must not be used to restrict profile photos or create VIP/VVIP profile tiers.

## 2. Mission and product principles

**Mission:** A privacy-first dating platform where adults can discover meaningful connections and communicate at their own pace.

- Adults only (18+).
- Privacy, informed consent and safety are core product requirements.
- Mobile-first responsive web experience, supporting desktop browsers.
- Users choose their relationship intentions; the precise options and discovery rules belong in the UX specification.
- Build a distinctive ELUDA identity rather than copying another dating service.
- Clearly distinguish planned, implemented and tested capabilities.
- Verification must not be presented as a guarantee of safety or trustworthiness.
- Monetisation should focus on chat access, not restricting access to people's profiles or photos.

## 3. Target users

**Target audience:** Adults aged 18+ across Uganda.

This is the selected target audience, not a claim that market demand has been validated. Specific segments, language needs, accessibility requirements and regional adoption assumptions may be researched without reopening the selected audience.

## 4. Core product experience

The planned experience includes:
1. Welcome, registration, login and account recovery.
2. Profile creation and editing.
3. Profile verification with honest explanation of its limitations.
4. Discovery, full profile details and all profile photos.
5. Likes and mutual matches.
6. User-selected relationship intentions and relevant discovery controls.
7. Daily Picks: a small set of approximately 3–5 recommended profiles shown within Discover. This is a recommendation feature, not a separate game or paid “Twin Picks” entitlement.
8. Icebreakers and private conversations, subject to the chat-access model below.
9. Notifications and privacy/safety controls.
10. Explicit consent before sharing personal contact details, reporting, blocking, unmatching and account deletion.

These are planned capabilities. Their implementation status must be checked in the repository and must not be inferred from this brief.

## 5. Monetisation and plan matrix

**Selected model:** Free browsing plus time-limited paid chat passes.

| Plan | Price | Duration |
|---|---:|---|
| Eluda Free | UGX 0 | Ongoing |
| Spark | UGX 5,000 | 24 hours |
| Connect | UGX 15,000 | 7 days |
| Plus | UGX 30,000 | 30 days |

### Chat access

| Capability | Eluda Free | Active paid pass |
|---|---|---|
| Browse profiles | Included | Included |
| View profile photos | All photos visible | All photos visible |
| Preset icebreakers | 15 per day | Available; exact limits, if any, to be specified consistently in UX |
| Read replies | Locked until a paid pass is active | Included during pass |
| Send custom message text | Not included | Included during pass |
| Ongoing chat / reply to conversations | Not included | Included during pass |

The key product rule is that users can browse the full discovery experience without paying; payment unlocks chat capabilities. Do not invent plan-specific discovery advantages.

### Removed from the current MVP direction

- VIP/VVIP profile tiers and restricted profile access.
- Blurred, locked or paywalled profile photos.
- “Twin Picks” as a paid or game-like feature.
- Paid priority placement and rewind.
- Paid tiers for “See who liked you”, profile viewers, advanced discovery filters or gold badges unless the owner explicitly reopens those decisions.

Daily Picks may remain a normal Discover recommendation component, with the exact presentation and recommendation logic to be settled in the UI/UX design.

### Payment implementation status

The plan names, prices and durations above are the working pricing decisions. Payment provider, purchase flow, refunds, pass activation/expiry and production integration require separate implementation planning and verification. Do not claim that passes can currently be purchased or that a payment integration is implemented.

## 6. Privacy, consent and safety boundaries

- The service is for adults aged 18 and older; do not design for minors.
- Never expose phone numbers, email addresses or other personal contact details without explicit consent.
- Keep safety and privacy controls free.
- Provide clear reporting, blocking and unmatching controls.
- Verification is not a guarantee that a person is safe or trustworthy.
- Do not use VIP/VVIP status or profile access restrictions to imply safety, trustworthiness or compatibility.
- Define account-deletion behaviour and data-retention periods honestly before launch.
- Assess applicable Ugandan privacy and data-protection obligations before launch.

## 7. Platform and technical direction

**Selected platform direction:** Responsive web application, with PWA support planned for consideration.

Current repository evidence indicates a Next.js frontend in `frontend/`. The broader proposed direction is Next.js + TypeScript + Tailwind CSS, with Python/Django and PostgreSQL considered for the backend. Authentication, storage, real-time messaging, hosting and production architecture require verification and approval; proposed technologies are not automatically approved decisions.

PWA scope and timing are not yet specified. Native mobile applications are not part of the selected initial platform direction.

## 8. Visual direction

Provisional direction: deep plum, warm ivory, rose pink and restrained gold accents, with strong typography, considered spacing, high-quality portrait imagery and polished responsive behaviour. These visual tokens remain provisional until approved in the UI/UX review.

## 9. Confirmed decisions and open questions

### Decisions recorded from prior product planning
- Brand: ELUDA.
- Mission: privacy-first dating where adults discover meaningful connections and communicate at their own pace.
- Target audience: adults across Uganda (18+).
- Users choose their relationship intentions.
- Platform: responsive web app, with PWA support planned for consideration.
- Chat-focused monetisation: Eluda Free, Spark (UGX 5,000 / 24 hours), Connect (UGX 15,000 / 7 days), Plus (UGX 30,000 / 30 days).
- Free users can browse profiles and see all photos.
- Free users receive 15 preset icebreakers per day.
- An active paid pass unlocks reading replies, sending custom message text and ongoing chat.
- Daily Picks are a normal Discover recommendation feature, not a paid Twin Picks feature or game.
- VIP/VVIP tiers and restricted/blurred photos are removed from the current MVP direction.
- Safety and privacy controls remain free.

### Open questions — not silently decided by this brief
- Final visual identity and design tokens.
- Exact relationship-intent options and their effects on discovery/matching.
- Daily Picks presentation and recommendation logic.
- Exact MVP scope, launch criteria and success metrics.
- Verification method/provider and operational review process.
- Backend, database, authentication, storage and real-time messaging architecture.
- PWA scope and implementation timing.
- Payment provider, purchase UX, refunds, pass expiry and production payment integration.
- Data-retention periods, moderation operations, languages and accessibility targets.

## 10. Current implementation status

This brief describes product direction and recorded decisions; it does not certify that the full product, backend, authentication, messaging, plan enforcement or payment flow exists. Check `PROJECT_STATUS.md` and verify the repository before implementation.

**Review note:** This revision removes stale Twin Picks and VIP/VVIP entitlements and restores the agreed chat-focused monetisation direction. Other project documents have not been changed.
