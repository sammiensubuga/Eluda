# ELUDA Decision Log

**Purpose:** Single record of important product, design, architecture and release decisions.

Statuses: **Approved**, **Proposed**, **Open**, **Superseded**. Only the product owner can approve key product and production decisions.

## DEC-001 — Initial audience and market
- **Status:** Approved
- **Decision:** ELUDA initially targets adults in Uganda.
- **Notes:** User research and segmentation remain to be validated.

## DEC-002 — Adult-only service
- **Status:** Approved
- **Decision:** The service is intended for adults aged 18 and above.

## DEC-003 — Privacy and consent
- **Status:** Approved
- **Decision:** Privacy, informed consent, contact-sharing control, reporting and blocking are foundational requirements.

## DEC-004 — UI/UX before feature implementation
- **Status:** Approved
- **Decision:** Complete and review the UI/UX system design before building the main frontend feature set.

## DEC-005 — Visual direction
- **Status:** Proposed
- **Proposal:** Deep plum, warm ivory, rose pink and restrained gold accents.
- **Open:** Final tokens, typography and component rules.

## DEC-006 — Technical stack
- **Status:** Open
- **Proposal:** Next.js/TypeScript/Tailwind frontend; Django and PostgreSQL backend; Django Channels/Redis if justified.
- **Open:** Confirm actual current architecture, then approve the final stack.

## DEC-007 — Monetisation
- **Status:** Open
- **Decision constraint:** No payment integration or premium features should be implemented until the monetisation model is approved.

## DEC-008 — Production change control
- **Status:** Approved
- **Decision:** Do not merge to production, deploy production or make destructive production changes without explicit owner approval.
