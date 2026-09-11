/**
 * Webhook verification round-trip tests — all 3 providers.
 * Self-signed fixtures, dummy secrets, no network, no accounts.
 * Run: npm run test
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { Webhook } from 'standardwebhooks';
import Stripe from 'stripe';
import { createHmac, randomBytes } from 'node:crypto';
import { handleWebhook } from '../shared/lib/payments';

const DODO_SECRET = 'whsec_' + randomBytes(32).toString('base64');

beforeAll(() => {
  process.env.DODO_PAYMENTS_WEBHOOK_SECRET = DODO_SECRET;
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy';
  process.env.LEMONSQUEEZY_WEBHOOK_SECRET = 'ls_dummy_secret';
});

describe('dodo webhooks', () => {
  const payload = JSON.stringify({
    business_id: 'bus_test',
    type: 'payment.succeeded',
    timestamp: '2026-09-05T00:00:00Z',
    data: {
      payload_type: 'Payment',
      payment_id: 'pay_test123',
      status: 'succeeded',
      total_amount: 12900,
      currency: 'USD',
      product_id: 'pdt_test',
      customer: { email: 'buyer@test.com' },
      metadata: { userId: 'u1' },
    },
  });
  const id = 'evt_test_dodo_1';
  const ts = String(Math.floor(Date.now() / 1000));

  it('verifies and normalizes payment.succeeded', async () => {
    const sig = new Webhook(DODO_SECRET).sign(id, new Date(Number(ts) * 1000), payload);
    const ev = await handleWebhook('dodo', payload, { signature: sig, id, timestamp: ts });
    expect(ev.type).toBe('payment.succeeded');
    expect(ev.provider).toBe('dodo');
    expect(ev.customerEmail).toBe('buyer@test.com');
    expect(ev.amount).toBe(12900);
    expect(ev.eventId).toBe(id);
  });

  it('rejects tampered signatures', async () => {
    await expect(
      handleWebhook('dodo', payload, { signature: 'v1,tampered', id, timestamp: ts }),
    ).rejects.toThrow();
  });
});

describe('stripe webhooks', () => {
  const stripe = new Stripe('sk_test_dummy');
  const payload = JSON.stringify({
    id: 'evt_test_stripe_1',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_1',
        object: 'checkout.session',
        customer_email: 'buyer@test.com',
        amount_total: 12900,
        currency: 'usd',
        metadata: { userId: 'u1' },
      },
    },
  });

  it('verifies and normalizes checkout.session.completed', async () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_dummy' });
    const ev = await handleWebhook('stripe', payload, { signature: header });
    expect(ev.type).toBe('payment.succeeded');
    expect(ev.provider).toBe('stripe');
    expect(ev.customerEmail).toBe('buyer@test.com');
    expect(ev.amount).toBe(12900);
  });

  it('rejects bad signatures', async () => {
    await expect(
      handleWebhook('stripe', payload, { signature: 't=123,v1=deadbeef' }),
    ).rejects.toThrow();
  });
});

describe('lemon squeezy webhooks', () => {
  const payload = JSON.stringify({
    meta: { event_name: 'order_created', custom_data: { userId: 'u1' } },
    data: {
      id: '1001',
      attributes: {
        user_email: 'buyer@test.com',
        total: 12900,
        currency: 'USD',
        first_order_item: { variant_id: 456 },
      },
    },
  });

  it('verifies and normalizes order_created', async () => {
    const sig = createHmac('sha256', 'ls_dummy_secret').update(payload).digest('hex');
    const ev = await handleWebhook('lemonsqueezy', payload, { signature: sig });
    expect(ev.type).toBe('payment.succeeded');
    expect(ev.provider).toBe('lemonsqueezy');
    expect(ev.customerEmail).toBe('buyer@test.com');
  });

  it('rejects bad signatures', async () => {
    await expect(
      handleWebhook('lemonsqueezy', payload, { signature: '0'.repeat(64) }),
    ).rejects.toThrow();
  });
});
