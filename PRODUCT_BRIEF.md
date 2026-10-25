# ELUDA Product Brief

**Document status:** Working product brief — owner decisions recorded; remaining items explicitly marked open  
**Last updated:** 2026-10-25  
**Product:** ELUDA  
**Repository:** https://github.com/sammiensubuga/Eluda

## 1. Summary

ELUDA is a privacy-first dating platform for adults across Uganda. Its mission is to help adults discover meaningful connections and communicate at their own pace. Users can choose their relationship intentions rather than being forced into a single assumed dating goal.

ELUDA uses a freemium model with time-limited paid passes. The agreed working price matrix and feature boundaries are recorded below. These are product decisions, not claims that payments or these features are implemented.

## 2. Mission and product principles

**Mission:** A privacy-first dating platform where adults can discover meaningful connections and communicate at their own pace.

- Adults only (18+).
- Privacy, informed consent and safety are core product requirements.
- Mobile-first responsive web experience, supporting desktop browsers.
- Users choose their relationship intentions; the precise option set and discovery rules must be defined in the UX specification.
- Build a distinctive ELUDA identity rather than copying another dating service.
- Clearly distinguish planned, implemented and tested capabilities.
- Verification must not be presented as a guarantee of safety or trustworthiness.

## 3. Target users

**Target audience:** Adults aged 18+ across Uganda.

This is the selected target audience, not a claim that market demand has been validated. Specific segments, language needs, accessibility requirements and regional adoption assumptions may be researched without reopening the selected audience.

## 4. Core product experience

The planned experience includes:
1. Welcome, registration, login and account recovery.
2. Profile creation and editing.
3. Profile verification with honest explanation of its limitations.
4. Discovery, profile details, likes and mutual matches.
5. Relationship-intent selection and discovery filters.
6. Daily Twin Picks: mutual recommendations, with plan-based daily allowances.
7. Icebreakers and private conversations, subject to the messaging access model below.
8. Notifications and profile-view/like visibility where the plan permits.
9. Contact-sharing consent, privacy settings, reporting, blocking, unmatching and account deletion.

These are planned capabilities. Their implementation status must be checked in the repository and must not be inferred from this brief.

## 5. Monetisation and plan matrix

**Working model:** Free access plus time-limited paid passes. The following plan names, prices and durations were previously selected.

| Plan | Price | Duration |
|---|---:|---|
| Eluda Free | UGX 0 | Ongoing |
| Spark | UGX 5,000 | 24 hours |
| Connect | UGX 15,000 | 7 days |
| Plus | UGX 30,000 | 30 days |

### Feature access

| Capability | Eluda Free | Spark | Connect | Plus |
|---|---|---|---|---|
| Ordinary profile discovery | Included | Included | Included | Included |
| Preset icebreakers | 15 per day | Unlimited | Unlimited | Unlimited |
| Custom icebreaker text | Not included | Included | Included | Included |
| Replies and ongoing chat | Requires a paid pass | Included during pass | Included during pass | Included during pass |
| Twin Picks per day | 1 | 3 | 5 | 10 |
| Basic discovery filters | Included | Included | Included | Included |
| Advanced discovery filters | Not included | Not included | Included | Included |
| See who liked you | Not included | Not included | Included | Included |
| Profile viewers | Not included | Not included | Included | Included |
| VIP profile access | Preview only | Preview only | Included | Included |
| VVIP profile access | Preview only | Preview only | Not included | Included |
| Gold badge | Not included | Not included | Not included | Included |

VIP and VVIP profile eligibility is to be curated by ELUDA, with the featured person's consent. These labels must not imply guaranteed trustworthiness, safety or compatibility.

### Free for everyone

The following remain free regardless of plan:
- Matching and likes
- Notifications
- Profile management
- Verification access (without implying verification guarantees trust)
- Safety and privacy controls
- Reporting, blocking and unmatching

**Explicit exclusions from the working model:** paid priority placement and rewind are removed from the plan. Do not reintroduce them without a new owner decision.

### Payment implementation status

The plan/pricing model is selected as the working product model, but payment provider, payment flow, refunds, expiry handling and production payment integration still require separate design and approval. Do not claim that paid passes can currently be purchased or that any payment integration is implemented.

## 6. Privacy, consent and safety boundaries

- The service is for adults aged 18 and older; do not design for minors.
- Never expose phone numbers, email addresses or other personal contact details without explicit consent.
- Keep safety and privacy controls free.
- Provide clear reporting, blocking and unmatching controls.
- Verification is not a guarantee that a person is safe or trustworthy.
- VIP/VVIP curation requires the featured person's consent and must not imply a safety endorsement.
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
- Monetisation working model: Eluda Free, Spark, Connect and Plus, with prices and durations as specified in Section 5.
- Daily Twin Picks allowances: Free 1, Spark 3, Connect 5, Plus 10.
- Free users receive 15 preset icebreakers daily; ongoing chat requires a paid pass.
- See Who Liked You and profile viewers are Connect/Plus benefits.
- Advanced filters are Connect/Plus benefits.
- Safety and privacy controls remain free.
- Priority placement and rewind are excluded from the current plan.

### Open questions — not silently decided by this brief
- Final visual identity and design tokens.
- Exact relationship-intent options and their effects on discovery/matching.
- Exact MVP scope, launch criteria and success metrics.
- Verification method/provider and operational review process.
- Backend, database, authentication, storage and real-time messaging architecture.
- PWA scope and implementation timing.
- Payment provider, payment UX, refunds, pass expiry and production payment integration.
- Data-retention periods, moderation operations, languages and accessibility targets.

## 10. Current implementation status

This brief describes product direction and recorded decisions; it does not certify that the full product, backend, authentication, messaging, plan enforcement or payment flow exists. Check `PROJECT_STATUS.md` and verify the repository before implementation.

**Review note:** This update restores prior monetisation decisions that were omitted from the previous draft. Other project documents have not been changed by this update.
