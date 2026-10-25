# ELUDA Product Brief

**Document status:** Initial draft; owner review required  
**Last updated:** 2026-10-25  
**Product:** Eluda  
**Repository:** https://github.com/sammiensubuga/Eluda

## 1. Summary
Eluda is a proposed privacy-first, mobile-first dating web application initially targeting adults in Uganda. It should help adults discover potential connections and communicate at their own pace through a clear, respectful and safe experience.

## 2. Mission and product principles
- Make meeting potential partners feel approachable, intentional and respectful.
- Treat privacy, informed consent and safety as core product requirements.
- Design mobile-first while supporting desktop browsers.
- Be transparent about verification, moderation, data handling and feature availability.
- Build a distinctive Eluda identity rather than copying another dating service.

## 3. Target users
**Initial target:** adults (18+) in Uganda who are interested in meeting people for dating or relationships. This is a product hypothesis, not validated user research. Specific segments, relationship intentions, languages, accessibility needs and connectivity constraints require research.

## 4. Intended core experience
The intended product journey includes:
1. Welcome and account registration/login/recovery.
2. Profile creation and editing.
3. Optional profile verification with clearly explained limitations.
4. Discovery and profile details.
5. Likes and mutual matches.
6. Private conversations.
7. Explicit, informed consent before sharing personal contact details.
8. Notifications and privacy/safety controls.
9. Reporting, blocking, unmatching and account deletion.

These are intended capabilities, not claims that they are currently implemented.

## 5. Product boundaries
- Adults only; do not design for minors.
- Do not expose phone numbers, email addresses or other contact details without explicit consent.
- Verification must never be described as a guarantee that a person is safe or trustworthy.
- Provide clear report, block and unmatch controls.
- Define deletion and retention behaviour honestly before launch.
- No payments, subscriptions or premium tier are approved for the initial scope.
- No feature may be advertised as available until implemented and tested.
- Assess applicable Ugandan privacy and data-protection requirements before launch.

## 6. Platform and technical direction
Current implementation evidence shows a Next.js frontend in `frontend/`. The broader proposed direction is Next.js + TypeScript + Tailwind CSS, with Python/Django and PostgreSQL considered for the backend. Authentication, storage, real-time messaging, hosting details and production architecture require verification and approval. Do not treat proposed technologies as settled architecture.

## 7. Initial visual direction
Provisional visual direction: deep plum, warm ivory, rose pink and restrained gold accents, with strong typography, considered spacing and polished responsive behaviour. These tokens remain provisional until explicitly approved in the design review.

## 8. Success criteria to define
Before launch, define measurable targets for activation, profile completion, meaningful conversations, retention, safety-report handling, accessibility and reliability. Do not invent baselines or claim market validation.

## 9. Confirmed vs proposed
### Confirmed project constraints
- Working brand: Eluda / ELUDA.
- Initial market: Uganda.
- Adult-only service.
- Privacy-first, mobile-first responsive web experience.
- UI/UX system design must be completed and approved before frontend feature implementation.
- Production changes require explicit owner approval.

### Proposals / open decisions
- Final visual identity and design tokens.
- Exact MVP and launch criteria.
- Relationship-intent options and discovery rules.
- Verification provider and process.
- Backend, database, authentication and real-time messaging architecture.
- Monetisation and any premium features.
- Data retention periods and operational moderation process.

## 10. Current status
The repository has a provisional public welcome page and an existing feature branch. This document does not certify that the full product, backend, authentication or listed user journeys exist. See `PROJECT_STATUS.md` and verify the live repository before implementation.
