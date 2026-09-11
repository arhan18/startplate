# Skill: Add an Auth Flow

**Trigger:** "Add login for X" or "Add signup with Y" or "Add password reset"

## Description

Add or modify authentication flows using Better Auth. The template includes email/password, Google, GitHub, magic link, passkeys, 2FA, organization invites, and API keys.

## Steps

1. **Identify the auth method** — email/password, social, magic link, passkey, or 2FA
2. **Check if already configured** in `shared/lib/auth.ts` — most methods are pre-built
3. **Add the flow** in the relevant page or component
4. **Protect routes** using the auth middleware
5. **Test** all flows end-to-end

## Files to Create/Modify

- `shared/lib/auth.ts` — Auth configuration (usually no changes needed)
- `src/pages/auth/[method].astro` — Auth pages
- `src/components/auth/[Component].astro` — Auth UI components
- `functions/api/hono.ts` — Protected API routes

## Pre-Built Auth Methods

| Method | Config | Status |
|--------|--------|--------|
| Email/Password | `emailAndPassword.enabled: true` | ✅ Built |
| Google OAuth | `socialProviders.google` | ✅ Built |
| GitHub OAuth | `socialProviders.github` | ✅ Built |
| Magic Link | `magicLink()` plugin | ✅ Built |
| Passkeys | `passkey()` plugin | ✅ Built |
| 2FA (TOTP) | `twoFactor()` plugin | ✅ Built |
| Organization | `organization()` plugin | ✅ Built |
| API Keys | `apiKey()` plugin | ✅ Built |
| Bearer Tokens | `bearer()` plugin | ✅ Built |

## Protecting API Routes

```typescript
// In functions/api/hono.ts
app.get('/api/protected', async (c) => {
  const session = c.get('session');
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  // session.user.id, session.user.email available
  return c.json({ userId: session.user.id });
});
```

## Protecting Pages

```astro
---
import { auth } from '@shared/lib/auth';

const session = await auth.api.getSession({
  headers: Astro.request.headers,
});

if (!session) {
  return Astro.redirect('/auth/login');
}
---

<!-- Page content only renders if authenticated -->
```

## Adding a New Social Provider

1. Add to `shared/lib/auth.ts`:
```typescript
socialProviders: {
  discord: {
    clientId: import.meta.env.DISCORD_CLIENT_ID || "",
    clientSecret: import.meta.env.DISCORD_CLIENT_SECRET || "",
  },
}
```

2. Add env vars to `.env`:
```
DISCORD_CLIENT_ID=xxxxx
DISCORD_CLIENT_SECRET=xxxxx
```

3. Add sign-in button in the auth component

## Notes

- All emails (verification, reset, magic link) sent via Resend
- Session expires after 7 days, refreshes daily
- Organization plugin supports roles: owner, admin, member
- API keys are scoped per-user, support rate limiting
- Never log session tokens or API keys
