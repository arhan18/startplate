# Skill: Add a Payment Flow

**Trigger:** "Add payments for X" or "Integrate checkout for Y" or "Add subscription billing"

## Description

Add payment processing using DodoPayments (default — Merchant of Record, India-friendly), Stripe, or Lemon Squeezy. One unified lib (`shared/lib/payments.ts`) — switch provider with `PAYMENT_PROVIDER="dodo" | "stripe" | "lemonsqueezy"`. Dodo handles tax, compliance, and payouts globally.

## Steps

1. **Set up DodoPayments account** and get API keys
2. **Create products/pricing** in Dodo dashboard
3. **Add checkout flow** using DodoPayments SDK
4. **Set up webhook** to handle payment events
5. **Add payment UI** components
6. **Test** with Dodo's test mode

## Files to Create/Modify

- `shared/lib/payments.ts` — DodoPayments wrapper
- `src/components/payment/[Component].astro` — Payment UI
- `functions/api/hono.ts` — Webhook endpoint
- `src/pages/checkout/success.astro` — Success page
- `src/pages/checkout/cancel.astro` — Cancel page

## DodoPayments Setup (default — plain REST, proven in production)

```typescript
// shared/lib/payments.ts
const baseUrl = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
  ? 'https://live.dodopayments.com'
  : 'https://test.dodopayments.com';

export async function createCheckoutSession(params: {
  productId: string;
  amount?: number;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  const res = await fetch(`${baseUrl}/checkouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
    },
    body: JSON.stringify({
      product_cart: [{ product_id: params.productId, quantity: 1, ...(params.amount ? { amount: params.amount } : {}) }],
      ...(params.customerEmail ? { customer: { email: params.customerEmail } } : {}),
      return_url: `${process.env.SITE_URL}/checkout/success`,
      metadata: params.metadata || {},
    }),
  });
  if (!res.ok) throw new Error(`Dodo checkout failed: ${await res.text()}`);
  return res.json() as Promise<{ checkout_url: string }>;
}

export async function getCustomer(customerId: string) {
  const res = await fetch(`${baseUrl}/customers/${customerId}`, {
    headers: { Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}` },
  });
  return res.json();
}
```

## Webhook Handler (Standard Webhooks — signed message is `webhook-id.webhook-timestamp.raw_body`)

```typescript
// In functions/api/hono.ts
import { Webhook } from 'standardwebhooks';

const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET || '';

app.post('/api/webhook/dodo', async (c) => {
  const rawBody = await c.req.text(); // NEVER c.req.json() first — signatures need exact bytes
  const wh = new Webhook(webhookSecret);
  try {
    await wh.verify(rawBody, {
      'webhook-id': c.req.header('webhook-id') || '',
      'webhook-signature': c.req.header('webhook-signature') || '',
      'webhook-timestamp': c.req.header('webhook-timestamp') || '',
    });
  } catch {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const event = JSON.parse(rawBody);
  switch (event.type) {
    case 'payment.succeeded':
      // Grant access to product
      break;
    case 'payment.failed':
      // Handle failed payment
      break;
    case 'subscription.created':
      // Grant subscription access
      break;
    case 'subscription.cancelled':
      // Revoke subscription access
      break;
  }

  return c.json({ received: true });
});
```

## Checkout Button Component

```astro
---
// src/components/payment/CheckoutButton.astro
export interface Props {
  productId: string;
  productName: string;
  price: string;
}

const { productId, productName, price } = Astro.props;
---

<button
  onclick={`checkout('${productId}')`}
  class="px-8 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-all"
>
  Get {productName} — {price}
</button>

<script>
  async function checkout(productId: string) {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    const { url } = await response.json();
    window.location.href = url;
  }
</script>
```

## Environment Variables

```
PAYMENT_PROVIDER="dodo"   # or "stripe" | "lemonsqueezy"
DODO_PAYMENTS_API_KEY=xxxxx
DODO_PAYMENTS_WEBHOOK_SECRET=xxxxx
STRIPE_SECRET_KEY=xxxxx           # only if PAYMENT_PROVIDER="stripe"
STRIPE_WEBHOOK_SECRET=xxxxx       # only if PAYMENT_PROVIDER="stripe"
LEMONSQUEEZY_API_KEY=xxxxx        # only if PAYMENT_PROVIDER="lemonsqueezy"
LEMONSQUEEZY_STORE_ID=xxxxx       # only if PAYMENT_PROVIDER="lemonsqueezy"
LEMONSQUEEZY_WEBHOOK_SECRET=xxxxx # only if PAYMENT_PROVIDER="lemonsqueezy"
SITE_URL=https://yourdomain.com
```

## Notes

- DodoPayments is the default (Merchant of Record — handles tax, compliance, payouts globally)
- Stripe + Lemon Squeezy are first-class: same `createCheckoutSession` / `handleWebhook` API, switch via `PAYMENT_PROVIDER`
- Stripe webhooks need the RAW body (signature over exact bytes) — never `request.json()` first
- Lemon Squeezy needs no SDK (REST + Web Crypto HMAC)
- India-friendly: supports INR, Indian payment methods, GST compliance
- Test mode: use Dodo's sandbox for development
- Webhook signature verification is critical — never skip it
- Store payment status in your database for quick access
- For subscriptions, Dodo handles renewal, failed payments, and cancellation
