# Email templates

The templates live in the Supabase dashboard under Authentication, Emails, Templates. This file is the source of truth; the owner pastes changes into the dashboard. Sign-up confirmation now uses the numeric code `{{ .Token }}` entered in the app and has no confirmation link. The Reset password template remains link-based, using `token_hash` with `type=recovery`.

Password reset emails use `redirectTo` set to the app's `/auth/confirm` URL with no query string and a `token_hash` link with `type=recovery`. Sign-up confirmation uses the numeric email code below and does not depend on a confirmation link. The other Supabase templates (invite, magic link, change email, reauthentication) are unchanged and unused.

## Confirm sign up

**Subject:** Your Eluda confirmation code

```html
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Use this code to confirm your email address.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf6f0;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;padding:32px;">
      <tr><td style="font-size:20px;font-weight:700;letter-spacing:1.6px;color:#4a2148;padding-bottom:20px;">Eluda</td></tr>
      <tr><td style="font-size:22px;font-weight:700;color:#28142b;padding-bottom:12px;">Your confirmation code</td></tr>
      <tr><td style="font-size:15px;line-height:24px;color:#4c3a4c;padding-bottom:20px;">Enter this code in Eluda to confirm your email address and finish creating your account.</td></tr>
      <tr><td align="center" style="padding-bottom:24px;"><div style="display:inline-block;background:#fbf6f0;border-radius:12px;padding:16px 24px;font-family:'Courier New',monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:#4a2148;">{{ .Token }}</div></td></tr>
      <tr><td style="font-size:13px;line-height:20px;color:#806e7e;">The code works for a limited time. If you did not create an Eluda account, you can ignore this email.</td></tr>
    </table>
  </td></tr>
</table>
```

In the Supabase dashboard, change **Confirm sign up**, not **Magic link or OTP** (that template is for passwordless sign-in, which Eluda does not use). The code length and expiry are dashboard settings under Authentication, Email provider, if shown. The app accepts 6 to 10 digits; the recommended values are length 8 and a short expiry.

## Reset password

**Subject:** Reset your Eluda password

```html
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Use this link to choose a new Eluda password.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf6f0;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;padding:32px;">
      <tr><td style="font-size:20px;font-weight:700;letter-spacing:1.6px;color:#4a2148;padding-bottom:20px;">Eluda</td></tr>
      <tr><td style="font-size:22px;font-weight:700;color:#28142b;padding-bottom:12px;">Reset your password</td></tr>
      <tr><td style="font-size:15px;line-height:24px;color:#4c3a4c;padding-bottom:24px;">Tap the button below to choose a new password for your Eluda account.</td></tr>
      <tr><td style="padding-bottom:24px;"><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=recovery" style="display:inline-block;background:#4a2148;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;">Choose a new password</a></td></tr>
      <tr><td style="font-size:13px;line-height:20px;color:#806e7e;">If the button does not work, copy this link into your browser:<br><span style="word-break:break-all;">{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=recovery</span></td></tr>
      <tr><td style="font-size:13px;line-height:20px;color:#806e7e;padding-top:20px;">The link works for a limited time. If you did not ask to reset your password, you can ignore this email and your password will stay the same.</td></tr>
    </table>
  </td></tr>
</table>
```
