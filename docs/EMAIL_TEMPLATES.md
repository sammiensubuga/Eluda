# Email templates

The templates live in the Supabase dashboard under Authentication, Emails, Templates. This file is the source of truth; the owner pastes changes into the dashboard.

Every auth email must be sent with `emailRedirectTo` or `redirectTo` set to the app's `/auth/confirm` URL with no query string. Links use `token_hash` with `type=email` for sign-up confirmation and `type=recovery` for password reset. The other Supabase templates (invite, magic link, change email, reauthentication) are unchanged and unused.

## Confirm sign up

**Subject:** Confirm your Eluda email

```html
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Confirm your email to finish creating your Eluda account.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf6f0;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;padding:32px;">
      <tr><td style="font-size:20px;font-weight:700;letter-spacing:1.6px;color:#4a2148;padding-bottom:20px;">Eluda</td></tr>
      <tr><td style="font-size:22px;font-weight:700;color:#28142b;padding-bottom:12px;">Confirm your email</td></tr>
      <tr><td style="font-size:15px;line-height:24px;color:#4c3a4c;padding-bottom:24px;">Tap the button below to confirm this email address and finish creating your Eluda account.</td></tr>
      <tr><td style="padding-bottom:24px;"><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=email" style="display:inline-block;background:#4a2148;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;">Confirm email</a></td></tr>
      <tr><td style="font-size:13px;line-height:20px;color:#806e7e;">If the button does not work, copy this link into your browser:<br><span style="word-break:break-all;">{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=email</span></td></tr>
      <tr><td style="font-size:13px;line-height:20px;color:#806e7e;padding-top:20px;">The link works for a limited time. If you did not create an Eluda account, you can ignore this email.</td></tr>
    </table>
  </td></tr>
</table>
```

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
