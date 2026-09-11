import { describe, it, expect } from 'vitest';

// Receipt email: pure HTML + best-effort Resend REST send.
// Resend HTTP stubbed at fetch; missing keys skip silently.

process.env.EMAIL_FROM = 'test@example.com';

let lastBody: Record<string, unknown> = {};
let failNext = false;
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: unknown, init?: { body?: unknown }) => {
  const url = String((input as { url?: string })?.url || input);
  if (url.includes('api.resend.com')) {
    if (failNext) {
      failNext = false;
      return new Response('bad', { status: 500 });
    }
    lastBody = JSON.parse(String((init as { body: string }).body || '{}'));
    return new Response(JSON.stringify({ id: 'stubbed' }), { status: 200 });
  }
  return realFetch(input as never, init as never);
}) as typeof fetch;

const evt = (over: Record<string, unknown> = {}) => ({
  type: 'payment.succeeded',
  provider: 'dodo',
  eventId: 'e_receipt_1',
  customerEmail: 'buyer@x.com',
  productId: 'pdt_starter',
  amount: 12900,
  currency: 'USD',
  metadata: {},
  ...over,
});

const fulfillment = (over: Record<string, unknown> = {}) => ({
  orderId: 'e_receipt_1',
  tier: 'pro',
  upgraded: true,
  duplicate: false,
  licenseKey: 'lic_abc123',
  ...over,
});

describe('receipt email', () => {
  it('html states only fulfillment facts (tier, order, key)', async () => {
    const { receiptHtml, tierName } = await import('../shared/lib/email');
    expect(tierName('starter')).toBe('Solo');
    expect(tierName('pro')).toBe('Team');
    expect(tierName('pro_plus')).toBe('Agency');
    const html = receiptHtml(evt() as never, fulfillment() as never);
    expect(html).toContain('e_receipt_1');
    expect(html).toContain('Team');
    expect(html).not.toContain('>pro<');
    expect(html).toContain('lic_abc123');
    expect(html).toContain('129.00 USD');
  });

  it('sends to buyer with tier subject via Resend REST', async () => {
    process.env.RESEND_API_KEY = 'test-key-never-sent';
    const { sendReceiptEmail } = await import('../shared/lib/email');
    expect(await sendReceiptEmail(evt() as never, fulfillment() as never)).toBe(true);
    expect(lastBody.to).toBe('buyer@x.com');
    expect(String(lastBody.subject)).toContain('Team');
    expect(String(lastBody.html)).toContain('lic_abc123');
  });

  it('skips duplicates + missing keys, survives Resend failure', async () => {
    const { sendReceiptEmail } = await import('../shared/lib/email');
    expect(await sendReceiptEmail(evt() as never, fulfillment({ duplicate: true }) as never)).toBe(false);
    delete process.env.RESEND_API_KEY;
    expect(await sendReceiptEmail(evt() as never, fulfillment() as never)).toBe(false);
    process.env.RESEND_API_KEY = 'test-key-never-sent';
    failNext = true;
    expect(await sendReceiptEmail(evt() as never, fulfillment() as never)).toBe(false);
  });
});
