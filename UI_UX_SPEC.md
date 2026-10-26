# ELUDA UI/UX Specification

**Status:** Initial specification; visual and screen decisions require owner approval  
**Last updated:** 2026-10-25

## 1. Design goals
- Mobile-first responsive web experience, with desktop support.
- Premium, warm, contemporary and welcoming without copying competitor interfaces.
- Clear hierarchy, accessible contrast, readable typography and predictable interactions.
- Privacy and safety controls must be easy to find and understand.
- Avoid manipulative engagement patterns and pressure around sharing contact information.
- Design for adults aged 18 and above.
- Clearly distinguish product decisions from designed, implemented, tested and deployed behavior.

## 2. Provisional visual direction
Proposed palette: deep plum, warm ivory, rose pink and restrained gold accents. These are provisional until approved. Exact hex values, typography, spacing scale, radii, shadows, icon rules and motion guidelines remain open.

## 3. Screen inventory (planned)
### Public access
- Welcome
- Registration (including Female/Male gender selection before connection-category selection)
- Login
- Account recovery

### Profile
- Profile setup
- Profile editing
- Photo management (minimum two photos required by current product direction)
- Verification information and status, with clear explanation of what verification does and does not establish
- Women's availability controls: Available, Busy and Hidden; Hidden profiles are excluded from Discovery

### Discovery and connection
- Discover (available only to signed-in users)
- Profile details
- Likes
- Match confirmation
- Matches list
- Daily Picks presentation (approximately 3–5 recommended profiles is the current direction; presentation and selection logic remain open)
- Relationship-intent selection and intent-specific profile fields; Meetups is an intent category and must not include price, rate or money fields.

### Messaging
- Conversation list
- Private conversation
- Male message-locked state and upgrade notice
- Plan selection/access information for Spark, Connect and Plus
- Message privacy and authorization states; no contact-sharing button or number-masking mechanic

### Account, safety and system
- Notifications
- Privacy settings
- Safety settings
- Report flow
- Block confirmation/management
- Unmatch flow
- Account deletion and retention explanation
- Loading, empty, error, success, offline and restricted states

### Administration
- Moderation queue and report review are possible operational requirements; access model and scope need approval.

This inventory is not a claim that these screens exist in code. The screen list is a starting point and must be reviewed with the owner.

## 4. Navigation principles
- Public visitors can reach registration and login without ambiguity.
- Signed-in navigation should expose only routes appropriate to the account state.
- Back navigation should preserve user context where safe.
- Reporting and blocking must not be hidden behind multiple layers.
- Destructive actions require clear explanations and confirmation.
- Contact sharing must be a deliberate, informed action, never an automatic side effect.
- Discovery is available only after sign-in.
- Do not imply a match, verification or payment state that the system has not confirmed.

## 5. Interaction rules
- Every control must have a clear label and visible state.
- Provide loading, disabled, success and error feedback where applicable.
- Prevent accidental repeated submissions.
- Do not reveal private information in previews, notifications or URLs.
- Verification indicators explain what was checked and what verification does not prove.
- Respect reduced-motion preferences.
- Forms need accessible labels, helpful validation and keyboard support.

### Messaging and Plan access states (design requirements)
- Women can initiate messages using unrestricted custom text without a preset icebreaker requirement; messaging is free for women.
- Men can initiate with up to 15 free preset icebreakers per day. Sending one does not unlock a woman's reply.
- Without an active Spark, Connect or Plus Plan, a male user must not be able to read or reply to a woman's message. Show only a chat bubble with a lock icon; do not expose message text or a teaser. The disabled read-only input displays: `Eluda can't continue this chat on your current plan. Upgrade your plan to keep going.` and a `See Plans` button opens the payment modal.
- With an active Spark, Connect or Plus Plan, the man can read the message and reply freely while access remains active.
- If the unlocked message contains a WhatsApp number, it becomes visible as part of the unlocked message.
- Locked message content must not be present in the page HTML, client state, API response or any client-accessible payload until server-side authorization succeeds. A blur, overlay or visual concealment alone is not security.
- Use the term Plan for Spark, Connect and Plus. VIP/VVIP profile tiers and paywalled profile photos are not part of the current product direction.
- Plan prices recorded in the Product Brief are product decisions, not proof that checkout or Plan activation is implemented. Payment UI and integration remain behind the relevant approval gate.

### Meetups category
- Meetups is an intent category for people who want to meet in person quickly. It has no price fields, rates or money inputs of any kind.

## 6. Responsive and accessibility requirements
- Design for narrow mobile screens first, then tablet and desktop.
- Avoid horizontal overflow and touch targets that are too small.
- Support keyboard navigation, visible focus, semantic headings and form labels.
- Maintain sufficient text/background contrast.
- Do not rely on colour alone to communicate status.
- Test representative viewport sizes and assistive-technology basics before release.
- Locked, restricted and error states must remain understandable to screen-reader and keyboard users.

## 7. Required state coverage
Every major screen should specify loading, empty, error, success and restricted states as relevant, including network failure and session expiry. Messaging must include both locked and unlocked states. Paid-Plan UI must not imply a successful purchase or active entitlement before the server confirms it.

## 8. Approval gates
Before frontend feature implementation, obtain owner approval for:
1. Screen map and user journeys.
2. Brand direction, colour tokens, typography and core components.
3. Discovery/profile interaction patterns.
4. Match and messaging flows, including the Blind Lock.
5. Privacy, safety and account-deletion screens.
6. Payment and Plan activation flows before any such implementation.

## 9. Current implementation note
A provisional welcome page exists according to prior project work. Re-inspect the current branch and preview before documenting exact layout, assets or pixel values as implemented. Requirements in this document describe intended behavior and do not assert that the corresponding features exist in code.
