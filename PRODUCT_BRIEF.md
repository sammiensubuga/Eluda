# ELUDA Product Brief

**Document status:** Revised draft — awaiting owner approval  
**Last updated:** 2026-10-25  
**Product:** ELUDA  
**Repository:** https://github.com/sammiensubuga/Eluda

## 1. Summary

ELUDA is a privacy-first dating web application for adults across Uganda. It helps adults discover meaningful connections and communicate at their own pace. Users should be able to express their own relationship intentions rather than being forced into one assumed dating goal.

This brief records the owner's current selections. It is not a claim that the product or its planned capabilities are already implemented, and it does not validate market demand.

## 2. Mission and product principles

**Mission:** A privacy-first dating platform where adults can discover meaningful connections and communicate at their own pace.

Product principles:
- Make meeting potential partners approachable, intentional and respectful.
- Treat privacy, informed consent and safety as core product requirements.
- Design a mobile-first responsive web experience that also works well on desktop browsers.
- Be transparent about verification, moderation, data handling and feature availability.
- Build a distinctive ELUDA identity rather than copying another dating service.
- Let users express their relationship intentions; the exact options and how they affect discovery remain open for design and research.

## 3. Target users

**Selected target audience:** Adults across Uganda (18+).

This is the initial target market, not validated user research. Specific user segments, relationship intentions, languages, accessibility needs, connectivity constraints and regional launch priorities still require research.

## 4. Intended core experience

The planned user journeys include:
1. Welcome and account registration, login and recovery.
2. Profile creation and editing.
3. Optional profile verification with clearly explained limitations.
4. Discovery and profile details.
5. Likes and mutual matches.
6. Private conversations.
7. Explicit, informed consent before sharing personal contact details.
8. Notifications and privacy/safety controls.
9. Reporting, blocking, unmatching and account deletion.

These are intended capabilities, not claims that they are currently implemented. Their scope, sequencing and interaction details must be approved in the UI/UX process.

## 5. Product boundaries and safety requirements

- The service is for adults aged 18 and older; do not design for minors.
- Do not expose phone numbers, email addresses or other personal contact details without explicit consent.
- Verification must never be described as a guarantee that a person is safe or trustworthy.
- Provide clear report, block and unmatch controls.
- Define deletion and data-retention behaviour honestly before launch.
- Privacy, informed consent and safety are core requirements.
- Paid features may be explored later, but no monetisation model, subscription, pricing or premium feature is approved.
- No feature may be advertised as available until it is implemented and tested.
- Assess applicable Ugandan privacy and data-protection requirements before launch.

## 6. Platform and technical direction

**Selected platform direction:** Responsive web application, with PWA support planned for consideration.

Current implementation evidence shows a Next.js frontend in `frontend/`. The broader proposed direction is Next.js + TypeScript + Tailwind CSS, with Python/Django and PostgreSQL considered for the backend. Authentication, storage, real-time messaging, hosting details and production architecture require verification and approval. Do not treat proposed technologies as settled architecture.

PWA scope and timing are not yet specified. Native mobile applications are not part of the selected initial platform direction.

## 7. Initial visual direction

Provisional visual direction: deep plum, warm ivory, rose pink and restrained gold accents, with strong typography, considered spacing and polished responsive behaviour. These visual tokens remain provisional until explicitly approved in the design review.

## 8. Success criteria to define

Before launch, define measurable targets for activation, profile completion, meaningful conversations, retention, safety-report handling, accessibility and reliability. Do not invent baselines or claim market validation.

## 9. Confirmed selections and open questions

### Selected by the owner in this review
- **Mission:** A privacy-first dating platform where adults can discover meaningful connections and communicate at their own pace.
- **Target audience:** Adults across Uganda (18+).
- **Relationship intentions:** Users should be able to choose their intentions; the available options and their effect on discovery are undecided.
- **Platform:** Responsive web app, with PWA support planned for consideration.
- **Privacy and consent:** Explicit consent for contact sharing, clear blocking/reporting controls, and honest communication about verification limitations remain core requirements.
- **Monetisation:** Paid features may be explored, but no monetisation model or paid feature is approved.

### Confirmed project constraints
- Working brand: ELUDA.
- Adult-only service.
- Privacy-first, mobile-first responsive web experience.
- UI/UX system design must be completed and approved before frontend feature implementation.
- Production changes require explicit owner approval.

### Open questions — not decided by this review
- Final visual identity and design tokens.
- Specific audience segments and regional launch strategy within Uganda.
- Relationship-intent choices, profile presentation and discovery/matching rules.
- Exact MVP scope and launch criteria.
- Verification method, provider, cost and review process.
- Backend, database, authentication, storage and real-time messaging architecture.
- Whether, when and how PWA capabilities should be implemented.
- Monetisation model, pricing and any premium features.
- Data retention periods and operational moderation process.
- Languages, accessibility targets and measurable success criteria.

## 10. Current status

The repository has a provisional public welcome page and an existing feature branch. This document does not certify that the full product, backend, authentication or listed user journeys exist. See `PROJECT_STATUS.md` and verify the live repository before implementation.

**Approval status:** This revision is awaiting owner approval. Other project documents have not been changed as part of this review.
