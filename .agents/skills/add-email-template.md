# Skill: Add an Email Template

**Trigger:** "Add an email template for X" or "Create a transactional email for Y"

## Description

Add a new Astro email template to `shared/email/`. Email templates use Astro components rendered to HTML strings, sent via Resend.

## Steps

1. **Create the template** at `shared/email/[TemplateName].astro`
2. **Add the export** in `shared/email/index.ts`
3. **Create the sender function** in the relevant lib file
4. **Test** by triggering the action that sends it

## Files to Create/Modify

- `shared/email/[TemplateName].astro` — Email template
- `shared/email/index.ts` — Export barrel
- `shared/lib/[relevant].ts` — Sender function

## Email Template Template

```astro
---
export interface Props {
  userName: string;
  actionUrl?: string;
  // Add more props as needed
}

const { userName, actionUrl } = Astro.props;
---

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .btn { display: inline-block; padding: 12px 24px; background: #00ffff; color: #000000; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="color: #ffffff; margin-bottom: 24px;">Hello, {userName}</h1>
    
    <p style="color: #a0a0a0; line-height: 1.6;">
      Your email content here.
    </p>

    {actionUrl && (
      <div style="margin: 32px 0;">
        <a href={actionUrl} class="btn">Take Action</a>
      </div>
    )}

    <div class="footer">
      <p>You received this email because you have an account with us.</p>
    </div>
  </div>
</body>
</html>
```

## Export Pattern

```typescript
// shared/email/index.ts
export { default as WelcomeEmail } from './WelcomeEmail.astro';
export { default as PasswordResetEmail } from './PasswordResetEmail.astro';
export { default as InvoiceEmail } from './InvoiceEmail.astro';
export { default as NotificationEmail } from './NotificationEmail.astro';
export { default as TrialEndingEmail } from './TrialEndingEmail.astro';
// Add new exports here
```

## Sending Emails

```typescript
import { Resend } from 'resend';
import { WelcomeEmail } from '@shared/email';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
  to: user.email,
  subject: 'Welcome to our platform!',
  html: await WelcomeEmail.renderToString({ userName: user.name }),
});
```

## Notes

- Use inline styles — many email clients strip `<style>` tags
- Keep design simple — email rendering is inconsistent across clients
- Always include unsubscribe link for marketing emails
- Test with Litmus or Email on Acid for cross-client compatibility
- Use Resend's free tier (100 emails/day) for development
