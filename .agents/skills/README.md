# Agent Skills — Startplate

This directory contains Agent Skills that AI coding agents can use to extend the codebase.

## Available Skills

### 1. add-page
Add a new page to the application.

**Trigger:** "Add a new page for X" or "Create a page that does Y"

**Steps:**
1. Create `.astro` file in `src/pages/`
2. Import Layout component
3. Add to navigation if needed
4. Test with `npm run dev`

### 2. add-api-route
Add a new API endpoint.

**Trigger:** "Add an API endpoint for X" or "Create a route that handles Y"

**Steps:**
1. Create `.ts` file in `functions/api/`
2. Define Zod schema for validation
3. Export Hono route handler
4. Register in `functions/api/hono.ts`

### 3. add-component
Add a new UI component.

**Trigger:** "Create a component for X" or "Build a Y component"

**Steps:**
1. Create `.astro` file in `src/components/`
2. Define TypeScript interface for props
3. Use Tailwind CSS for styling
4. Export as default

### 4. add-email-template
Add a new email template.

**Trigger:** "Create an email template for X" or "Add a Y email"

**Steps:**
1. Create `.astro` file in `shared/email/`
2. Define props interface
3. Use inline styles (email compatibility)
4. Export from `shared/email/index.ts`

### 5. add-database-table
Add a new database table.

**Trigger:** "Add a table for X" or "Create a Y model"

**Steps:**
1. Add SQL to `functions/api/schema.sql`
2. Add helpers to `shared/lib/db.ts`
3. Add API routes if needed
4. Run migration

### 6. add-auth-flow
Add authentication to a route.

**Trigger:** "Add auth to X" or "Protect this route"

**Steps:**
1. Import auth helpers from `shared/lib/auth.ts`
2. Add middleware to check session
3. Redirect to login if unauthenticated
4. Add user context to page

### 7. add-payment-flow
Add payment to a feature.

**Trigger:** "Add payment for X" or "Monetize this feature"

**Steps:**
1. Create product in DodoPayments dashboard
2. Add checkout button component
3. Handle webhook in `functions/api/webhook.ts`
4. Deliver product/service after payment

### 8. add-i18n
Add internationalization to a page.

**Trigger:** "Translate this page" or "Add i18n support"

**Steps:**
1. Add translations to `src/i18n/`
2. Use translation function in component
3. Add language switcher if needed
4. Test all languages

### 9. seo-optimization
Meta tags, JSON-LD, sitemap, OG images. SEO from day one.

### 10. performance-tuning
Core Web Vitals: images, fonts, JS budget, caching.

### 11. security-audit
XSS, CSRF, webhooks, auth bypass, secrets. Run before launch.

### 12. checkout-integration
Dodo checkout: sessions, payment links, custom amounts, return URLs.
**Trigger:** "Add checkout" or "One-time payment flow"

### 13. subscription-integration
Trials, upgrades/downgrades, dunning recovery, self-serve portal.
**Trigger:** "Add subscriptions" or "Recurring billing"

### 14. webhook-integration
Verified webhooks for all providers: raw body, signatures, idempotency.
**Trigger:** "Handle webhooks" or "Verify payment events"

### 15. testing-and-go-live
Test mode → production: test cards, local webhooks, go-live checklist.
**Trigger:** "Test payments" or "Go live checklist"

### 16. e2e-testing
Playwright browser tests: locators, web-first assertions, responsive, mocks.
**Trigger:** "Add E2E test" or "Test the checkout flow"

### 17. seo-audit
0–100 SEO health score + prioritized action plan. Run before every launch.
**Trigger:** "SEO audit" or "Why isn't my page ranking"

*Skills 9–14 are adapted from MIT-licensed works — see `ATTRIBUTION.md`.*

## How to Use

AI agents can discover these skills by reading this file. When a user asks to add a feature, the agent should:

1. Identify which skill matches the request
2. Follow the steps in that skill
3. Use existing patterns from the codebase
4. Test the implementation

## Adding New Skills

To add a new skill:
1. Create a new `.md` file in this directory
2. Follow the format above
3. Include trigger phrases
4. List clear steps
