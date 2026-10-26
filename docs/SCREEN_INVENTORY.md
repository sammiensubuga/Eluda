# ELUDA Screen Inventory

**Status:** Planned inventory; not proof of implementation  
**Last updated:** 2026-10-25

Priority labels are working planning proposals, not final delivery commitments. Screen status must be based on repository or test evidence, not on inclusion in this inventory.

| ID | Screen / flow | Priority | Status |
|---|---|---|---|
| PUB-01 | Welcome | P0 | Provisional page previously reported; re-verify |
| AUTH-01 | Registration: Female/Male selection before connection category | P0 | Unverified |
| AUTH-02 | Login | P0 | Unverified |
| AUTH-03 | Account recovery | P0 | Unverified |
| PROF-01 | Profile setup and connection-category selection | P0 | Planned |
| PROF-02 | Profile edit and photo management; minimum two photos | P0 | Planned |
| PROF-03 | Women's availability: Available, Busy, Hidden | P0 | Planned |
| PROF-04 | Meetups intent category (no price, rate or money fields) | P0 | Planned |
| VER-01 | Verification explanation and status | P1 | Planned |
| DISC-01 | Discover (signed-in users only) | P0 | Planned |
| DISC-02 | Profile details | P0 | Planned |
| DISC-03 | Daily Picks (approximately 3–5 recommended profiles; detailed behavior open) | P1 | Planned |
| LIKE-01 | Likes | P1 | Planned |
| MATCH-01 | Match confirmation and list | P0 | Planned |
| CHAT-01 | Conversation list | P0 | Planned |
| CHAT-02 | Private conversation and unlocked message state | P0 | Planned |
| CHAT-03 | Male Blind Lock: locked message notice and inaccessible message content | P0 | Planned |
| CHAT-04 | Chat Plan information: Spark, Connect and Plus | P1 | Planned; purchase/activation flow needs separate approval |
| CONS-01 | Contact-sharing consent | P1 | Planned |
| NOTIF-01 | Notifications that do not expose private message content | P1 | Planned |
| PRIV-01 | Privacy settings | P0 | Planned |
| SAFE-01 | Safety settings | P0 | Planned |
| SAFE-02 | Report flow | P0 | Planned |
| SAFE-03 | Block and unmatch | P0 | Planned |
| ACC-01 | Account deletion and retention explanation | P0 | Planned |
| ADM-01 | Moderation tools | To decide | Operational scope open |

## Key screen requirements

- **Messaging:** Women can send unrestricted custom messages for free and do not need preset icebreakers. Men can initiate with up to 15 free preset icebreakers per day; that does not unlock a woman's reply.
- **Male Blind Lock:** Without an active Spark, Connect or Plus Plan, show only a chat bubble with a lock icon, never message text or a teaser. The disabled read-only input displays `Eluda can't continue this chat on your current plan. Upgrade your plan to keep going.` and a `See Plans` button opens the payment modal. Locked message content must not reach the client until server-side authorization succeeds.
- **Unlocked messaging:** An active pass unlocks reading women's messages and free replies while access is active. Any WhatsApp number contained in the message becomes visible as part of the unlocked content.
- **Plans:** Spark is UGX 5,000 / 24 hours; Connect is UGX 15,000 / 7 days; Plus is UGX 30,000 / 30 days; Eluda Free is UGX 0 ongoing. These are recorded product decisions, not evidence of a live checkout or entitlement system.
- **Meetups:** This is an intent category for people who want to meet in person quickly; it has no price, rate or money fields.
- **Discovery/profile:** Discovery requires sign-in; profiles require at least two photos. Women's Hidden profiles are excluded from Discovery. Verification is not a guarantee of trustworthiness.
- **Safety:** Reporting, blocking and unmatching are free safety controls. VIP/VVIP profile tiers and paywalled profile photos are not in the current product direction.

## State coverage
For each screen, document applicable loading, empty, error, success, restricted, offline and session-expired states. Include locked and unlocked messaging states, unavailable/expired pass states, validation errors for category-specific rates, and clear confirmation for destructive actions. Final priority and screen behavior require owner approval.

## Notes
- This inventory is aligned to the current `PRODUCT_BRIEF.md` and `UI_UX_SPEC.md`.
- The screen list describes planned UX; it does not establish that routes or features are implemented.
- Before frontend implementation, review this inventory alongside `docs/USER_JOURNEYS.md` and obtain owner approval.
