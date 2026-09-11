# Skill: E2E Testing (Playwright)

**Trigger:** "Add E2E test" or "Test the checkout flow" or "Browser test for X" or "Flaky test"

## Description

End-to-end browser tests with Playwright + TypeScript. Tests live in `tests/`, run with `npm run test:e2e`. Cover critical buyer paths: landing → pricing → checkout button → success page, auth flows, admin actions.

## Steps

1. **Write specs in `tests/`** — one file per flow (`checkout.spec.ts`, `auth.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test('buyer reaches checkout', async ({ page }) => {
  await page.goto('/pricing');
  await page.getByRole('link', { name: /get starter/i }).click();
  await expect(page).toHaveURL(/checkout/);
});
```
2. **Locators (priority order)**: `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → test ID → CSS last resort. Never XPath
3. **Assertions**: web-first auto-retrying (`toBeVisible()`, `toHaveURL()`, `toHaveText()`). Never `waitForTimeout` sleeps
4. **Structure**: wrap phases in `test.step()` for readable failure reports
5. **Isolation**: every test sets up and tears down its own state; no shared mutable state, no order dependence
6. **Responsive**: run the critical flow at 375px (mobile), 768px, 1280px
7. **Mock payments**: intercept checkout APIs (`page.route('**/api/checkout', …)`) — never hit live providers from tests

## Rules

- Each test asserts a VISIBLE state, not just URL/status — hides render regressions otherwise
- Flaky test protocol: trace viewer first (`trace: 'on-first-retry'`), fix the wait — never add sleeps, never skip
- CI: retries 2, HTML report, screenshots/video on failure only
- Cover error states (failed payment, empty cart, signed-out admin) alongside every happy path
