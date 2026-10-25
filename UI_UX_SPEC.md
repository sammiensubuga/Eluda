# ELUDA UI/UX Specification

**Status:** Initial specification; visual and screen decisions require owner approval  
**Last updated:** 2026-10-25

## 1. Design goals
- Mobile-first responsive web experience, with desktop support.
- Premium, warm, contemporary and welcoming without copying competitor interfaces.
- Clear hierarchy, accessible contrast, readable typography and predictable interactions.
- Privacy and safety controls must be easy to find and understand.
- Avoid manipulative engagement patterns and pressure around sharing contact information.

## 2. Provisional visual direction
Proposed palette: deep plum, warm ivory, rose pink and restrained gold accents. These are provisional until approved. Exact hex values, typography, spacing scale, radii, shadows, icon rules and motion guidelines remain open.

## 3. Screen inventory (planned)
### Public access
- Welcome
- Registration
- Login
- Account recovery

### Profile
- Profile setup
- Profile editing
- Photo management
- Verification information and status

### Discovery and connection
- Discover
- Profile details
- Likes
- Match confirmation
- Matches list

### Messaging
- Conversation list
- Private conversation
- Contact-sharing consent flow

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

This inventory is not a claim that these screens exist in code.

## 4. Navigation principles
- Public visitors can reach registration and login without ambiguity.
- Signed-in navigation should expose only routes appropriate to the account state.
- Back navigation should preserve user context where safe.
- Reporting and blocking must not be hidden behind multiple layers.
- Destructive actions require clear explanations and confirmation.
- Contact sharing must be a deliberate, informed action, never an automatic side effect.

## 5. Interaction rules
- Every control must have a clear label and visible state.
- Provide loading, disabled, success and error feedback where applicable.
- Prevent accidental repeated submissions.
- Do not reveal private information in previews, notifications or URLs.
- Verification indicators explain what was checked and what verification does not prove.
- Respect reduced-motion preferences.
- Forms need accessible labels, helpful validation and keyboard support.

## 6. Responsive and accessibility requirements
- Design for narrow mobile screens first, then tablet and desktop.
- Avoid horizontal overflow and touch targets that are too small.
- Support keyboard navigation, visible focus, semantic headings and form labels.
- Maintain sufficient text/background contrast.
- Do not rely on colour alone to communicate status.
- Test representative viewport sizes and assistive-technology basics before release.

## 7. Required state coverage
Every major screen should specify loading, empty, error, success and restricted states as relevant, including network failure and session expiry.

## 8. Approval gates
Before frontend feature implementation, obtain owner approval for:
1. Screen map and user journeys.
2. Brand direction, colour tokens, typography and core components.
3. Discovery/profile interaction patterns.
4. Match and messaging flows.
5. Contact-sharing consent.
6. Privacy, safety and account-deletion screens.

## 9. Current implementation note
A provisional welcome page exists according to prior project work. Re-inspect the current branch and preview before documenting exact layout, assets or pixel values as implemented.
