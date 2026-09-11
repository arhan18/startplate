# Skill: Checkout Integration (DodoPayments)

**Trigger:** "Add checkout for X" or "Create payment link for Y" or "One-time payment flow"

## Description

Hosted checkout via `shared/lib/payments.ts` (Dodo default). Amounts in smallest currency unit (cents/paise). Never grant access from the return URL — entitlement happens in the verified webhook (`webhook-integration`).

## Steps

1. **Create the product** in Dodo dashboard (test mode first) — copy the `product_id`
2. **Create the session server-side** — never expose API keys to the browser:
```typescript
import { createCheckoutSession } from '@shared/lib/payments';

const session = await createCheckoutSession({
  productId: 'pdt_xxx',
  amount: 12900, // $129.00 — custom amount for PWYW/pricing tiers
  customerEmail: user.email,
  successUrl: `${process.env.SITE_URL}/checkout/success`,
  metadata: { userId: user.id, type: 'purchase' },
});
return Response.json({ url: session.url });
```
3. **Redirect the buyer** to `session.url` (or open Dodo overlay with the URL)
4. **Handle fulfillment in the webhook** — `payment.succeeded` → grant access, send confirmation email

## Rules

- `DODO_PAYMENTS_ENVIRONMENT` must be explicit: `test_mode` dev, `live_mode` prod (SDKs default to live — footgun)
- Test and live are separate worlds: products, keys, webhooks, customers — nothing carries over
- `return_url` gets `?status=success` — informational only, NOT proof of payment
- Static payment links (dashboard) work for no-code sales; sessions for dynamic amounts/metadata

## Environment Variables

```
PAYMENT_PROVIDER="dodo"
DODO_PAYMENTS_API_KEY="dodo_test_xxx"
DODO_PAYMENTS_ENVIRONMENT="test_mode"
SITE_URL=https://yourdomain.com
```
