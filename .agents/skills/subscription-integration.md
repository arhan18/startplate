# Skill: Subscription Integration (DodoPayments)

**Trigger:** "Add subscriptions" or "Recurring billing" or "Trials, upgrades, dunning"

## Description

Recurring billing via Dodo Checkout Sessions + subscription webhooks. Trials, plan changes with proration, failed-payment (dunning) recovery, and self-serve portal.

## Steps

1. **Create subscription products** in Dodo dashboard (monthly + yearly `product_id`s)
2. **Checkout with trial** via `createCheckoutSession` — pass trial in metadata/product config; Dodo handles the trial clock
3. **Track lifecycle in your DB** — statuses: `pending → active → (on_hold on failed payment) → cancelled/expired`. A trialing subscription reports `active`
4. **Handle webhook events** (`shared/pages/api/webhook.ts` normalizes all of these):
   - `subscription.created` / `subscription.active` → grant access
   - `subscription.updated` / `subscription.renewed` / `plan_changed` → sync tier + billing date
   - `subscription.on_hold` → notify customer, prompt payment-method update (dunning)
   - `subscription.cancelled` / `expired` → revoke access, send confirmation
5. **Plan changes**: create new checkout for the target product; Dodo prorates mid-cycle credits/charges automatically
6. **Self-serve portal**: `createCustomerPortalUrl(customerId)` from `shared/lib/payments.ts` — let users upgrade/downgrade/cancel without support tickets

## Rules

- Failed payments move to `on_hold` (recoverable) — never revoke instantly; dunning first
- Use the webhook `eventId` as idempotency key — Dodo retries deliveries (8 attempts)
- Store `subscription_id` + status + current-period-end in your DB; never rely on client state
- Test renewals with Dodo test clocks/cards before launch (`testing-and-go-live`)
