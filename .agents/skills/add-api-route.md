# Skill: Add an API Route

**Trigger:** "Add an API endpoint for X" or "Create a backend route for Y"

## Description

Add a new API route using Hono in `functions/api/hono.ts`. Routes use Zod for validation and can be protected with auth middleware.

## Steps

1. **Open** `functions/api/hono.ts`
2. **Add the route** using Hono's chainable API
3. **Add Zod validation** for request body/params
4. **Protect with auth** if needed (use `auth` middleware)
5. **Return typed responses** — always return JSON with consistent shape
6. **Test** with `npm run dev` and curl/Postman

## Files to Create/Modify

- `functions/api/hono.ts` — Add route definition
- `shared/lib/db.ts` — Add database helper if needed

## Route Template

```typescript
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/z-validator';

const app = new Hono();

// Public route
app.get('/api/your-route', async (c) => {
  return c.json({ success: true, data: {} });
});

// Validated route
const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

app.post('/api/your-route',
  zValidator('json', createSchema),
  async (c) => {
    const data = c.req.valid('json');
    // Process data
    return c.json({ success: true, id: crypto.randomUUID() });
  }
);

// Protected route (requires auth)
app.get('/api/protected-route', async (c) => {
  const session = c.get('session');
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  // Use session.user.id
  return c.json({ success: true, userId: session.user.id });
});

export default app;
```

## Response Format

Always return consistent JSON:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "Error message" }
```

## Notes

- Routes in `functions/api/hono.ts` are automatically registered
- Use `zValidator` for request validation — it auto-rejects invalid requests
- Auth middleware sets `c.get('session')` if user is authenticated
- For file uploads, use Cloudflare R2 via `shared/lib/r2.ts`
- For background jobs, use `shared/lib/jobs.ts`
