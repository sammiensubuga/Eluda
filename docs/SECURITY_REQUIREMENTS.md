# ELUDA Security Requirements

**Status:** Baseline requirements; implementation audit pending

## Identity and access
- Enforce permissions server-side for every private resource.
- Users may access only data and conversations they are authorised to see.
- Apply least privilege to staff, moderators and automated services.
- Protect session lifecycle, password recovery and account suspension flows.

## Input and abuse controls
- Validate all client-supplied data server-side.
- Apply appropriate rate limits and abuse detection to authentication, likes, messages and reports.
- Protect against injection, cross-site scripting, cross-site request forgery where relevant, insecure direct object references and mass assignment.
- Safely validate uploaded photos and restrict file type, size and access.

## Sensitive data
- Keep secrets out of source control and client-side bundles.
- Minimise logs containing personal or message content.
- Protect contact details and verification records with strict access controls.
- Use secure transport and appropriate encryption for stored data based on risk and provider capabilities.

## Operational security
- Separate development, preview and production credentials.
- Define backup, restoration, incident response and credential rotation procedures.
- Review dependencies and security advisories.
- Audit privileged moderation access and security-relevant changes where appropriate.

## Required review cases
- A user cannot retrieve another user's private contact details.
- A non-participant cannot read a conversation.
- A blocked user cannot continue prohibited interactions as defined by product rules.
- Contact-sharing cannot be triggered without explicit consent.
- Suspended/deleted accounts behave according to approved policy.
- Rate limits and abuse controls resist automated misuse.

## Status
Requirements only. Do not mark controls implemented or tested without code inspection and test evidence.
