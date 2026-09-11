# ============================================================
# Startplate — AI Agent Guide
# ============================================================

## Project Structure

```
src/            → Product-specific code (components, pages, layouts)
shared/         → Shared library (lib, components, email, i18n, styles)
functions/      → Cloudflare Functions (API routes)
tests/          → Vitest + Playwright tests
docs/           → Documentation (Starlight)
.migrations/    → Database migrations
.agents/        → AI agent skills
```

## Key Files

| File | Purpose |
|------|---------|
| `shared/lib/auth.ts` | Authentication (Better Auth) |
| `shared/lib/db.ts` | Database helpers (Turso) |
| `shared/lib/payments.ts` | Payment processing (Dodo default + Stripe + Lemon Squeezy) |
| `shared/lib/analytics.ts` | Analytics integration |
| `shared/layouts/ProductLayout.astro` | Base layout with SEO |
| `shared/styles/shared.css` | Design system tokens |
| `functions/api/hono.ts` | API routes (Hono) |

## Adding Pages

1. Create `src/pages/your-page.astro`
2. Import `ProductLayout` from `@shared/layouts/ProductLayout.astro`
3. Use design tokens from `@shared/styles/shared.css`
4. Add navigation link in layout

## Adding API Routes

1. Edit `functions/api/hono.ts`
2. Add route with Hono: `app.get('/api/your-route', ...)`
3. Use Zod for validation
4. Use `auth` middleware for protected routes

## Adding Components

1. Create `src/components/YourComponent.astro`
2. Use Tailwind classes from design system
3. Import from `@shared/components/` for shared components

## Database

- Schema: `migrations/schema.sql`
- Helpers: `shared/lib/db.ts`
- Tables: users, sessions, organizations, members, projects, slots

## Testing

- Unit tests: `npm run test` (Vitest)
- E2E tests: `npm run test:e2e` (Playwright)
- Test files: `tests/*.spec.ts`

## Deployment

```bash
npm run build
npx wrangler pages deploy dist --project-name=your-project
```

## Attribution (license rule — do not skip)

- Every project ships `shared/components/seo/MadeWithStartplate.astro` in its footer.
- **Starter license: NEVER remove or hide it.** Removal breaches the license.
- **Pro license:** keeping it is optional (it funds the $0/yr stack for everyone).
- **Pro+ license:** white-label — remove freely.
