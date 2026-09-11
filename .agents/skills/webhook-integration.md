# Skill: Webhook Integration (all providers)

**Trigger:** "Handle webhooks" or "Verify payment events" or "Webhook endpoint"

## Description

Verified webhook handling for Dodo/Stripe/Lemon Squeezy via `handleWebhook()` in `shared/lib/payments.ts`. Signature verification is mandatory — unverified webhooks can be spoofed.

## Steps

1. **Read the raw body** — `await request.text()`. NEVER `request.json()` first (signatures are computed over exact bytes; re-serializing breaks them)
2. **Collect provider headers**:
   - Dodo (Standard Webhooks): `webhook-id` + `webhook-signature` (`v1,base64…`) + `webhook-timestamp`. Signed message = `id.timestamp.raw_body`
   - Stripe: `stripe-signature`
   - Lemon Squeezy: `x-signature` (HMAC-SHA256 hex)
3. **Verify + normalize** — one call handles all of it:
```typescript
import { handleWebhook } from '@shared/lib/payments';

const event = await handleWebhook(provider, rawBody, {
  signature,
  id: request.headers.get('webhook-id') || undefined,        // Dodo only
  timestamp: request.headers.get('webhook-timestamp') || undefined, // Dodo only
});
// event = { type, provider, eventId, customerEmail, productId, amount, currency, metadata }
```
4. **Idempotency**: `event.eventId` is the dedupe key — record it, skip repeats (providers retry: Dodo 8 attempts)
5. **Respond fast**: verify → persist/ack `200` → process async. Slow handlers hit provider timeouts (Dodo: 15s) and cause duplicate storms

## Rules

- 401 on ANY verification failure — never grant access on error
- Grant access ONLY from verified webhooks, never from `return_url`/`success` page visits
- Events can arrive out of order — make handlers order-safe (compare timestamps/status, don't assume sequence)
- Local testing: `dodo wh listen http://localhost:4321/api/webhook` (real signed test events) or `dodo wh trigger payment.success` (unsigned mocks)
