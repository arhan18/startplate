import { describe, it, expect, beforeAll } from 'vitest';

// Checkout creation (provider APIs stubbed) + fulfillment lifecycle.
// Dodo/LemonSqueezy HTTP is stubbed at fetch; Stripe live path untested
// by design (needs real keys) — routing errors are tested instead.

process.env.TURSO_DATABASE_URL = 'file:/tmp/startplate-pay-test.db';
delete process.env.TURSO_AUTH_TOKEN;
process.env.PAYMENT_PROVIDER = 'dodo';
process.env.DODO_PAYMENTS_API_KEY = 'test-key';
process.env.DODO_PRODUCTS_JSON = JSON.stringify({
  pdt_starter: { tier: 'starter', kind: 'full' },
  pdt_pro: { tier: 'pro', kind: 'full' },
  pdt_s2p: { tier: 'pro', kind: 'upgrade', from: 'starter' },
});

let lastDodoBody: Record<string, unknown> = {};
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: unknown, init?: { body?: unknown }) => {
  const url = String((input as { url?: string })?.url || input);
  if (url.includes('dodopayments.com')) {
    lastDodoBody = JSON.parse(String((init as { body: string }).body || '{}'));
    return new Response(
      JSON.stringify({ checkout_url: 'https://pay.test/c1', checkout_id: 'c1' }),
      { status: 200 }
    );
  }
  if (url.includes('lemonsqueezy.com')) {
    return new Response(
      JSON.stringify({ data: { attributes: { url: 'https://pay.test/ls1' } } }),
      { status: 200 }
    );
  }
  return realFetch(input as never, init as never);
}) as typeof fetch;

describe('checkout creation', () => {
  it('builds the proven Dodo request shape and returns the URL', async () => {
    const { createCheckoutSession } = await import('../shared/lib/payments');
    const s = await createCheckoutSession({
      productId: 'pdt_starter',
      customerEmail: 'buy@x.com',
      successUrl: 'https://x.com/ok',
      metadata: { coupon_code: 'ALAN20', rekomi_ref: 'r1' },
    });
    expect(s.url).toBe('https://pay.test/c1');
    expect(s.sessionId).toBe('c1');
    const cart = (lastDodoBody.product_cart as Record<string, unknown>[])[0];
    expect(cart.product_id).toBe('pdt_starter');
    expect((lastDodoBody.metadata as Record<string, string>).coupon_code).toBe('ALAN20');
    expect((lastDodoBody.metadata as Record<string, string>).rekomi_ref).toBe('r1');
    expect(lastDodoBody.return_url).toBe('https://x.com/ok');
  });

  it('throws on Dodo failure instead of returning a dead link', async () => {
    const { createCheckoutSession } = await import('../shared/lib/payments');
    (globalThis as Record<string, unknown>).__failDodo = true;
    const orig = globalThis.fetch;
    globalThis.fetch = (async () => new Response('nope', { status: 500 })) as typeof fetch;
    await expect(
      createCheckoutSession({ productId: 'pdt_starter', successUrl: 'https://x.com/ok' })
    ).rejects.toThrow(/Dodo checkout failed/);
    globalThis.fetch = orig;
  });

  it('rejects unknown providers', async () => {
    process.env.PAYMENT_PROVIDER = 'nope';
    const { createCheckoutSession } = await import('../shared/lib/payments');
    await expect(
      createCheckoutSession({ productId: 'x', successUrl: 'https://x.com/ok' })
    ).rejects.toThrow(/Unknown PAYMENT_PROVIDER/);
    process.env.PAYMENT_PROVIDER = 'dodo';
  });
});

describe('product catalog', () => {
  it('resolves full + upgrade products, rejects unknown', async () => {
    const { resolveProduct } = await import('../shared/lib/payments');
    expect(resolveProduct('pdt_starter')).toEqual({ tier: 'starter', kind: 'full' });
    expect(resolveProduct('pdt_s2p')).toEqual({ tier: 'pro', kind: 'upgrade', from: 'starter' });
    expect(() => resolveProduct('pdt_evil')).toThrow(/Unknown product_id/);
  });
});

describe('fulfillment (real migrateSchema + file DB)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fulfill: any;

  beforeAll(async () => {
    const dbMod = await import('../shared/lib/db');
    await dbMod.migrateSchema();
    db = dbMod.getDb();
    ({ fulfillPaymentSucceeded: fulfill } = await import('../shared/lib/payments'));
    for (const t of ['share_claims', 'licenses', 'orders']) {
      await db.execute(`DELETE FROM ${t}`);
    }
  });

  const evt = (over: Record<string, unknown> = {}) => ({
    type: 'payment.succeeded',
    provider: 'dodo',
    eventId: `evt_${Math.random().toString(36).slice(2)}`,
    customerEmail: 'buyer@x.com',
    productId: 'pdt_starter',
    amount: 12900,
    currency: 'USD',
    metadata: {},
    ...over,
  });

  it('grants Starter license on first purchase', async () => {
    const r = await fulfill(evt({ eventId: 'e1' }), db);
    expect(r.tier).toBe('starter');
    expect(r.duplicate).toBe(false);
    expect(r.licenseKey).toMatch(/^lic_[0-9a-f]{32}$/);
    const lic = await db.execute({ sql: 'SELECT tier, seats, updates_until FROM licenses WHERE email=?', args: ['buyer@x.com'] });
    expect(lic.rows[0].tier).toBe('starter');
    expect(lic.rows[0].seats).toBe(1);
  });

  it('is idempotent on redelivery', async () => {
    const r = await fulfill(evt({ eventId: 'e1' }), db);
    expect(r.duplicate).toBe(true);
    const n = await db.execute('SELECT COUNT(*) as c FROM orders');
    expect(Number(n.rows[0].c)).toBe(1);
  });

  it('stamps cashback_forbidden on coupon orders', async () => {
    await fulfill(evt({ eventId: 'e2', metadata: { coupon_code: 'ALAN20' } }), db);
    const o = await db.execute({ sql: 'SELECT coupon_code, cashback_forbidden FROM orders WHERE id=?', args: ['e2'] });
    expect(o.rows[0].coupon_code).toBe('ALAN20');
    expect(o.rows[0].cashback_forbidden).toBe(1);
  });

  it('records the instant-delivery waiver when the buyer consented', async () => {
    await fulfill(evt({ eventId: 'e2w', metadata: { instant_delivery_waiver: 'true' } }), db);
    const o = await db.execute({ sql: 'SELECT waiver FROM orders WHERE id=?', args: ['e2w'] });
    expect(o.rows[0].waiver).toBe(1);
    await fulfill(evt({ eventId: 'e2n' }), db);
    const n = await db.execute({ sql: 'SELECT waiver FROM orders WHERE id=?', args: ['e2n'] });
    expect(n.rows[0].waiver).toBe(0);
  });

  it('refuses upgrades without lower-tier ownership', async () => {
    await expect(
      fulfill(evt({ eventId: 'e3', customerEmail: 'new@x.com', productId: 'pdt_s2p' }), db)
    ).rejects.toThrow(/requires owning starter/);
  });

  it('upgrades Starter owners to Pro via difference product', async () => {
    const r = await fulfill(evt({ eventId: 'e4', productId: 'pdt_s2p' }), db);
    expect(r.tier).toBe('pro');
    expect(r.upgraded).toBe(true);
    const lic = await db.execute({ sql: 'SELECT tier, seats FROM licenses WHERE email=?', args: ['buyer@x.com'] });
    expect(lic.rows[0].tier).toBe('pro');
    expect(lic.rows[0].seats).toBe(5);
  });

  it('refuses unknown products and missing emails', async () => {
    await expect(fulfill(evt({ eventId: 'e5', productId: 'pdt_evil' }), db)).rejects.toThrow(/Unknown product_id/);
    await expect(fulfill(evt({ eventId: 'e6', customerEmail: undefined }), db)).rejects.toThrow(/Missing customer email/);
  });
});
