# Skill: Testing & Go-Live (payments)

**Trigger:** "Test payments" or "Go live checklist" or "Test mode to production"

## Description

Take payment flows from test mode to production without surprises. Test and live are fully isolated worlds.

## Steps

1. **Lock test mode in dev** — `DODO_PAYMENTS_ENVIRONMENT="test_mode"` in `.env`. SDKs default to live — an unset variable must never select live
2. **Test cards & scenarios** — use Dodo's documented test cards/VPAs for success, decline, and regional methods (test mode only)
3. **Test webhooks locally**:
```bash
dodo wh listen http://localhost:4321/api/webhook   # real signed test events, forwarded
dodo wh trigger payment.success http://localhost:4321/api/webhook  # unsigned mock
```
4. **Simulate renewals** — advance test subscriptions, force a failed payment, confirm `on_hold` → dunning email → recovery path
5. **Migrate catalog to live** — recreate products/prices in live dashboard (nothing carries over), swap keys, register the live webhook URL (HTTPS)
6. **Go-live checklist**:
   - [ ] Live keys in production env, test keys nowhere near prod
   - [ ] Live webhook endpoint registered + returns 200 on signed test event
   - [ ] `payment.succeeded` grants access end-to-end (real $1 test, then refund)
   - [ ] Refund + cancel paths revoke access
   - [ ] Customer portal link works
   - [ ] Success/cancel pages + confirmation emails fire

## Rules

- Do ONE real live transaction (minimum amount) before announcing — then refund it
- Keep a `webhookLog` table keyed by `eventId` from day one (idempotency + audit trail)
- Never log full card/PII data — log event IDs and statuses only
