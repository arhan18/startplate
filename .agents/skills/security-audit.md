# Skill: Security Audit

**Trigger:** "Audit for security" or "Check for vulnerabilities" or "Harden the app"

## Description

Review and harden the application against common web vulnerabilities: XSS, CSRF, SQL injection, authentication bypass, and data exposure.

## Steps

1. **Check environment variables** — no secrets in client-side code
2. **Validate all inputs** — use Zod for API validation
3. **Sanitize outputs** — prevent XSS in templates
4. **Verify auth** — all protected routes check session
5. **Check CORS** — restrict to your domain
6. **Audit dependencies** — run `npm audit`
7. **Test** common attack vectors

## Files to Create/Modify

- `functions/api/hono.ts` — API security
- `shared/lib/auth.ts` — Auth security
- `.env.example` — Document required secrets
- `wrangler.toml` — Cloudflare security headers

## Security Checklist

### Environment Variables
```bash
# NEVER commit these to git
TURSO_DATABASE_URL=xxxxx
TURSO_AUTH_TOKEN=xxxxx
RESEND_API_KEY=xxxxx
DODO_API_KEY=xxxxx
DODO_WEBHOOK_SECRET=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx
GITHUB_CLIENT_SECRET=xxxxx
```

### Input Validation
```typescript
// ALWAYS validate with Zod
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

app.post('/api/endpoint', zValidator('json', schema), async (c) => {
  const data = c.req.valid('json'); // Auto-rejects if invalid
  // data is now typed and validated
});
```

### XSS Prevention
```astro
<!-- Astro escapes by default — safe -->
<h1>{userInput}</h1>

<!-- DANGER: Never use set:html with user input -->
<!-- <div set:html={userInput}></div>  ← XSS VULNERABILITY -->

<!-- Safe: only use set:html with trusted content -->
<div set:html={trustedHtml}></div>
```

### CSRF Protection
```typescript
// Better Auth handles CSRF automatically
// For custom endpoints, verify Origin header:
app.post('/api/sensitive', async (c) => {
  const origin = c.req.header('origin');
  if (origin !== process.env.SITE_URL) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  // ...
});
```

### SQL Injection
```typescript
// NEVER concatenate SQL strings
// BAD: `SELECT * FROM users WHERE id = '${userId}'`
// GOOD: Use parameterized queries
await db.execute({
  sql: 'SELECT * FROM users WHERE id = ?',
  args: [userId],
});
```

### API Security
```typescript
// Rate limiting (add via Cloudflare)
// CORS (restrict to your domain)
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', process.env.SITE_URL || '');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  await next();
});

// Webhook signature verification (CRITICAL)
app.post('/api/webhook', async (c) => {
  const body = await c.req.text();
  const signature = c.req.header('x-webhook-signature');
  
  if (!verifySignature(body, signature)) {
    return c.json({ error: 'Invalid signature' }, 401);
  }
  // Process webhook
});
```

### Security Headers (Cloudflare)
```toml
# wrangler.toml
[env.production]
[env.production.headers]
[[env.production.headers.values]]
name = "X-Content-Type-Options"
value = "nosniff"
[[env.production.headers.values]]
name = "X-Frame-Options"
value = "DENY"
[[env.production.headers.values]]
name = "Referrer-Policy"
value = "strict-origin-when-cross-origin"
```

## Common Vulnerabilities

| Vulnerability | Prevention |
|--------------|------------|
| XSS | Astro escapes by default; never `set:html` user input |
| SQL Injection | Always use parameterized queries |
| CSRF | Better Auth handles this; verify Origin on custom endpoints |
| Auth Bypass | Check session on every protected route |
| Data Exposure | Never log secrets; filter sensitive data from API responses |
| Dependency Vulns | Run `npm audit` monthly; use `npm audit fix` |

## Notes

- Turso uses parameterized queries by default — SQL injection is prevented at the driver level
- Better Auth handles session management, CSRF, and OAuth security
- DodoPayments webhook signature verification is critical — never skip it
- Never commit `.env` files — only `.env.example` with placeholder values
- Use `npm audit` regularly and fix critical vulnerabilities immediately
