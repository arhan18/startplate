# Shared Library Workflow

## ⚠️ CRITICAL WORKFLOW RULES (READ BEFORE DOING ANYTHING)

### Rule 1: Learn From Mistakes — Never Repeat Them
Before doing ANY task:
1. **Check memory first** — Search for past mistakes on similar tasks
2. **Read existing code patterns** — Don't assume, verify
3. **Test BEFORE deploying** — Not after
4. **Verify API format** — Cloudflare ≠ Astro ≠ Vercel

### Rule 2: Cloudflare Pages Functions Format
```typescript
// ✅ CORRECT for Cloudflare Pages Functions
export async function onRequestPost(context) {
  const { ENV_VAR } = context.env;  // NOT import.meta.env
  const body = await context.request.json();
  return new Response(JSON.stringify({ data: 'value' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// ❌ WRONG — This is Astro format, NOT Cloudflare
import type { APIRoute } from 'astro';
export const POST: APIRoute = async ({ request }) => {
  const data = import.meta.env.VAR;  // WRONG for Cloudflare
};
```

### Rule 3: Test Checklist Before Deploy
- [ ] Playwright test passes
- [ ] Manual browser test (fill form, click button, verify flow)
- [ ] API endpoints return JSON (not HTML)
- [ ] Console has no errors
- [ ] Payment flow works end-to-end
- [ ] Email sends correctly
- [ ] Database writes correctly

### Rule 4: DodoPayments Custom Amounts
```typescript
// To charge custom amount, use quantity
product_cart: [{
  product_id: 'pdt_xxx',
  quantity: amount,  // user's selected amount
}]
```

### Rule 5: Environment Variables
- **Cloudflare Functions:** `context.env.VAR_NAME`
- **Astro pages:** `import.meta.env.PUBLIC_VAR`
- **Never mix them up**

### Rule 6: Errors to NEVER Repeat
| Error | Wrong | Correct |
|-------|-------|---------|
| DodoPayments SDK URL | `@dodopayments/browser` | `@dodopayments/sdk@latest/dist/web.js` |
| DodoPayments init | `DodoPayments()` | `Initialize()` |
| DodoPayments overlay | `dodo.payments.overlay()` | `dodo payments.overlay()` |
| DodoPayments custom amount | `amount: amount` | `quantity: amount` |
| Resend email domain | `onboarding@resend.dev` | Verified domain (`email@arhanahmad.com`) |
| Cloudflare Functions | `export const POST: APIRoute` | `export async function onRequestPost(context)` |
| Cloudflare env vars | `import.meta.env.VAR` | `context.env.VAR` |
| SQLite datetime | `datetime("now")` | `datetime('now')` (single quotes) |
| Certificate page | `Astro.url.searchParams` | `window.location.search` (client-side) |
| Email to contributors | Send to all subscribers | Only send to paying contributor |

### Rule 7: Test API Keys IMMEDIATELY
Before using any API key:
1. Test with a simple request first
2. Verify the response
3. Don't assume it works — prove it works

---

## How to Use the Shared Library

When building a new product, copy the shared components to your product directory:

```bash
# From your product directory
cp -r ~/Documents/arhan-hub/shared/* .
```

Then update import paths in your components.

## Shared Library Structure

```
shared/
├── components/
│   ├── auth/
│   │   ├── SignUp.astro
│   │   ├── SignIn.astro
│   │   └── UserMenu.astro
│   ├── payment/
│   │   ├── PayButton.astro
│   │   └── SubscriptionButton.astro
│   ├── admin/
│   │   ├── DataTable.astro
│   │   ├── DashboardLayout.astro
│   │   ├── StatsCard.astro
│   │   └── Sidebar.astro
│   ├── seo/
│   │   ├── SEOHead.astro
│   │   └── JsonLd.astro
│   ├── onboarding/
│   │   ├── OnboardingForm.astro
│   │   └── StepIndicator.astro
│   └── ui/
│       ├── Modal.astro
│       └── Toast.astro
├── layouts/
│   └── ProductLayout.astro
├── lib/
│   ├── auth.ts          (Better Auth)
│   ├── db.ts            (Turso database helpers)
│   ├── i18n.ts          (Internationalization)
│   ├── jobs.ts          (Cloudflare Cron)
│   └── monitoring.ts    (Sentry)
├── i18n/
│   ├── en.json          (English translations)
│   ├── ur.json          (Urdu translations)
│   └── hi.json          (Hindi translations)
├── blog-mdx/
│   ├── content/
│   │   └── config.ts    (Content collection schema)
│   └── README.md        (Setup instructions)
├── testing/
│   ├── vitest.config.ts (Test configuration)
│   ├── example.test.ts  (Example tests)
│   └── README.md        (Setup instructions)
├── docs/
│   └── README.md        (Starlight docs setup)
├── pages/
│   ├── checkout/
│   │   └── success.astro
│   └── api/
│       ├── auth/
│       │   ├── sign-up.ts
│       │   ├── sign-in.ts
│       │   ├── sign-out.ts
│       │   └── session.ts
│       └── webhook.ts
├── styles/
│   └── shared.css
├── COMPARISON.md
└── WORKFLOW.md
```

## API Routes (Cloudflare Pages Functions)

### Authentication
- `POST /api/auth/sign-up` — Create account
- `POST /api/auth/sign-in` — Sign in
- `POST /api/auth/sign-out` — Sign out
- `GET /api/auth/session` — Get current session

### Multi-Tenancy
- `GET /api/orgs` — List user's organizations
- `POST /api/orgs` — Create organization
- `GET /api/orgs/:orgId` — Get organization details
- `GET /api/orgs/:orgId/members` — List members
- `POST /api/orgs/:orgId/members` — Invite member
- `DELETE /api/orgs/:orgId/members/:memberId` — Remove member

### Slots (for OutbidCopy)
- `GET /api/slots` — List all slots
- `GET /api/slots/:position` — Get slot by position

### Health Check
- `GET /api/health` — API health check

## Database Schema

### Tables
- `users` — User accounts
- `sessions` — User sessions
- `orgs` — Organizations
- `members` — Organization membership
- `projects` — Organization projects
- `slots` — Ad slots (OutbidCopy)

### Migration
Run the migration from `functions/api/schema.sql`:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Organizations table
CREATE TABLE IF NOT EXISTS orgs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(org_id, user_id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
);
```

## Blog System (MDX)

### Adding a New Post
1. Create a new `.mdx` file in `src/content/blog/`
2. Add frontmatter with:
   - `title` — Post title
   - `description` — Short description
   - `date` — Publication date
   - `author` — Author name (default: Arhan Ahmad)
   - `tags` — Array of tags
   - `image` — Optional featured image
   - `draft` — Set to true to hide from listing

### Example Post
```mdx
---
title: "How I Built 24 Products"
description: "My journey building a portfolio of small web products"
date: 2026-09-01
author: "Arhan Ahmad"
tags: ["indie-hacking", "saas"]
image: "/images/blog/building-products.jpg"
---

## Introduction

This is my new post using MDX.

## Features

- Rich content with JSX components
- Code blocks with syntax highlighting
- Image optimization
- Draft support
```

## Internationalization (i18n)

### Adding a New Language
1. Create a new translation file in `src/i18n/` (e.g., `es.json`)
2. Add the locale to `src/lib/i18n.ts`
3. Update the astro.config.mjs locales config

### Translation File Structure
```json
{
  "nav": {
    "home": "Home",
    "products": "Products",
    "blog": "Blog",
    "docs": "Documentation"
  },
  "hero": {
    "title": "Welcome to {product}",
    "subtitle": "Build amazing things",
    "cta": "Get Started"
  }
}
```

### Usage in Components
```astro
---
import { t } from '../lib/i18n';
const { locale } = Astro.params;
---

<h1>{t(locale, 'hero.title')}</h1>
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm run test:coverage
```

### Writing Tests
Create test files next to the code they test:
```
src/lib/utils.ts
src/lib/utils.test.ts
```

### Example Test
```ts
import { describe, it, expect } from 'vitest';
import { formatPrice } from './utils';

describe('formatPrice', () => {
  it('formats USD correctly', () => {
    expect(formatPrice(9.99)).toBe('$9.99');
  });
});
```

## Documentation (Starlight)

### Adding a New Doc Page
1. Create a new `.mdx` file in `src/content/docs/`
2. Add frontmatter with title and description
3. The sidebar updates automatically

### Example Doc Page
```mdx
---
title: Installation
description: How to install and set up the product
---

## Prerequisites

- Node.js 22+
- npm or yarn

## Installation

```bash
npm install your-product
```

## Next Steps

- [Quick Start](/quick-start)
- [Configuration](/configuration)
```

## Stack for All Products

| Component | Technology | Cost |
|-----------|------------|------|
| Framework | Astro 7 | Free |
| Styling | Tailwind CSS 4 | Free |
| Hosting | Cloudflare Pages | Free |
| Database | Turso (SQLite) | Free |
| Payments | DodoPayments | 4% + 40¢ |
| Email | Resend | Free (100/day) |
| Auth | Better Auth | Free |
| API | Hono + Zod | Free |
| Monitoring | Sentry | Free tier |
| i18n | astro-i18n-aut | Free |
| Blog | @astrojs/mdx | Free |
| Testing | Vitest | Free |
| Docs | @astrojs/starlight | Free |

## Build Command

```bash
npm run build
```

## Deploy Command

```bash
npx wrangler pages deploy dist --project-name=<your-project>
```

## Testing Locally

```bash
# Start dev server
npm run dev

# Or test with Cloudflare Functions
npx wrangler pages dev dist --port 8788
```

## Key Files to Copy

For each new product, copy these files:

1. `shared/components/auth/*` — Auth components
2. `shared/components/payment/*` — Payment components
3. `shared/components/seo/*` — SEO components
4. `shared/components/ui/*` — UI components
5. `shared/lib/db.ts` — Database helpers
6. `shared/lib/i18n.ts` — Internationalization
7. `shared/i18n/*.json` — Translation files
8. `shared/blog-mdx/content/config.ts` — Blog schema
9. `shared/testing/vitest.config.ts` — Test config
10. `shared/styles/shared.css` — Shared styles
11. `functions/api/health.ts` — Health endpoint

## Environment Variables

Required environment variables:

```bash
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
RESEND_API_KEY=re_your-key
DODO_PAYMENTS_API_KEY=your-key
```

## Notes

- All products use the same stack
- No vendor lock-in (Cloudflare, Turso, DodoPayments)
- $0 hosting cost
- Type-safe API with Hono + Zod
- Multi-tenancy built-in
- MDX blog system
- i18n support (en, ur, hi)
- Vitest testing
- Starlight documentation
