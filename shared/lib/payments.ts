/**
 * Unified Payment Processing
 *
 * DodoPayments is the DEFAULT (Merchant of Record — handles global tax,
 * compliance, payouts; India-friendly). Stripe and Lemon Squeezy are
 * first-class alternatives. Switch provider with one env var.
 *
 *   PAYMENT_PROVIDER="dodo" | "stripe" | "lemonsqueezy"
 *   DODO_PAYMENTS_ENVIRONMENT="test_mode" | "live_mode" (default test_mode)
 *
 * Install only what you use:
 *   npm i standardwebhooks   (Dodo signature verify — tiny, no SDK needed)
 *   npm i stripe              (Stripe checkout + verify)
 *   # Lemon Squeezy needs no SDK — plain REST + Web Crypto
 *   # Dodo checkout needs no SDK — plain REST (proven in production)
 *
 * Cloudflare Workers safe: no Node-only APIs.
 */

export type PaymentProvider = 'dodo' | 'stripe' | 'lemonsqueezy';

export interface CheckoutOptions {
  /** Provider product identifier (Dodo product_id, Stripe price_id, LS variant_id) */
  productId: string;
  /** Amount in smallest currency unit (cents/paise) — Dodo custom amount / Stripe / LS */
  amount?: number;
  currency?: string;
  customerEmail?: string;
  successUrl: string;
  /** Free-form passthrough (forwarded untouched by all providers).
   *  Contract: checkout UI sends instant_delivery_waiver='true' + coupon_code / rekomi_ref when present. */
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  /** Redirect the buyer here (hosted checkout) */
  url: string;
  /** Provider checkout id for reconciliation (may be empty until webhook) */
  sessionId: string;
}

/** Normalized webhook event — same shape regardless of provider */
export interface NormalizedPaymentEvent {
  type:
    | 'payment.succeeded'
    | 'payment.failed'
    | 'payment.refunded'
    | 'subscription.created'
    | 'subscription.updated'
    | 'subscription.cancelled';
  provider: PaymentProvider;
  /** Provider event/delivery id (idempotency key) */
  eventId: string;
  customerEmail?: string;
  productId?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, string>;
}

/** Raw webhook headers as received (names vary per provider) */
export interface WebhookHeaders {
  signature: string;
  id?: string;
  timestamp?: string;
}

function getProvider(): PaymentProvider {
  const p = (process.env.PAYMENT_PROVIDER || 'dodo').toLowerCase();
  if (p === 'stripe' || p === 'lemonsqueezy' || p === 'dodo') return p;
  throw new Error(`Unknown PAYMENT_PROVIDER="${p}". Use dodo, stripe, or lemonsqueezy.`);
}

function isLive(): boolean {
  return process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
}

// ============================================================
// CHECKOUT SESSION
// ============================================================

export async function createCheckoutSession(opts: CheckoutOptions): Promise<CheckoutSession> {
  const provider = getProvider();
  if (provider === 'stripe') return createStripeSession(opts);
  if (provider === 'lemonsqueezy') return createLemonSqueezyCheckout(opts);
  return createDodoSession(opts);
}

async function createDodoSession(opts: CheckoutOptions): Promise<CheckoutSession> {
  // Proven REST shape (live in production): POST {test|live}.dodopayments.com/checkouts
  const baseUrl = isLive() ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';
  const res = await fetch(`${baseUrl}/checkouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY!}`,
    },
    body: JSON.stringify({
      product_cart: [
        {
          product_id: opts.productId,
          quantity: 1,
          ...(opts.amount ? { amount: opts.amount } : {}),
        },
      ],
      ...(opts.customerEmail ? { customer: { email: opts.customerEmail } } : {}),
      return_url: opts.successUrl,
      metadata: opts.metadata || {},
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Dodo checkout failed (${res.status}): ${err}`);
  }
  const json = (await res.json()) as { checkout_url?: string; checkout_id?: string; id?: string };
  return { url: json.checkout_url || '', sessionId: json.checkout_id || json.id || '' };
}

async function createStripeSession(opts: CheckoutOptions): Promise<CheckoutSession> {
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: opts.successUrl,
    cancel_url: opts.successUrl,
    customer_email: opts.customerEmail,
    metadata: opts.metadata,
    line_items: [
      {
        price: opts.productId.startsWith('price_') ? opts.productId : undefined,
        price_data: opts.productId.startsWith('price_')
          ? undefined
          : {
              currency: (opts.currency || 'usd').toLowerCase(),
              product_data: { name: opts.metadata?.productName || 'Purchase' },
              unit_amount: opts.amount,
            },
        quantity: 1,
      },
    ],
  });
  return { url: session.url || '', sessionId: session.id };
}

async function createLemonSqueezyCheckout(opts: CheckoutOptions): Promise<CheckoutSession> {
  // Lemon Squeezy REST API — no SDK needed
  const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY!}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: opts.customerEmail,
            custom: opts.metadata || {},
          },
          ...(opts.amount ? { custom_price: opts.amount, custom_price_decimal: true } : {}),
        },
        relationships: {
          store: { data: { type: 'stores', id: process.env.LEMONSQUEEZY_STORE_ID! } },
          variant: { data: { type: 'variants', id: opts.productId } },
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Lemon Squeezy checkout failed: ${res.status}`);
  const json = (await res.json()) as {
    data: { id: string; attributes: { url: string } };
  };
  return { url: json.data.attributes.url, sessionId: json.data.id };
}

// ============================================================
// WEBHOOK VERIFICATION + NORMALIZATION
// ============================================================

/**
 * Verify + normalize a provider webhook.
 * @param rawBody Raw request body as TEXT (not parsed JSON — signatures need exact bytes)
 * @param headers Signature headers. Dodo needs id+timestamp (Standard Webhooks):
 *   { signature, id: webhook-id, timestamp: webhook-timestamp }
 */
export async function handleWebhook(
  provider: PaymentProvider,
  rawBody: string,
  headers: WebhookHeaders,
): Promise<NormalizedPaymentEvent> {
  if (provider === 'stripe') return handleStripeWebhook(rawBody, headers.signature);
  if (provider === 'lemonsqueezy') return handleLemonSqueezyWebhook(rawBody, headers.signature);
  return handleDodoWebhook(rawBody, headers);
}

async function handleDodoWebhook(
  rawBody: string,
  headers: WebhookHeaders,
): Promise<NormalizedPaymentEvent> {
  // Standard Webhooks: signed message = webhook-id.webhook-timestamp.raw_body
  if (!headers.id || !headers.timestamp) {
    throw new Error('Missing webhook-id / webhook-timestamp headers');
  }
  const { Webhook } = await import('standardwebhooks');
  const wh = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_SECRET!);
  await wh.verify(rawBody, {
    'webhook-id': headers.id,
    'webhook-signature': headers.signature,
    'webhook-timestamp': headers.timestamp,
  });

  const event = JSON.parse(rawBody) as {
    type: string;
    data?: {
      payload_type?: string;
      payment_id?: string;
      subscription_id?: string;
      status?: string;
      total_amount?: number;
      currency?: string;
      product_id?: string;
      customer?: { email?: string; customer_id?: string };
      metadata?: Record<string, string>;
    };
  };
  const d = event.data || {};
  const map: Record<string, NormalizedPaymentEvent['type']> = {
    'payment.succeeded': 'payment.succeeded',
    'payment.failed': 'payment.failed',
    'payment.processing': 'payment.failed',
    'payment.cancelled': 'payment.failed',
    'refund.succeeded': 'payment.refunded',
    'subscription.active': 'subscription.created',
    'subscription.renewed': 'subscription.updated',
    'subscription.updated': 'subscription.updated',
    'subscription.plan_changed': 'subscription.updated',
    'subscription.cancelled': 'subscription.cancelled',
    'subscription.expired': 'subscription.cancelled',
  };
  return {
    type: map[event.type] || 'payment.succeeded',
    provider: 'dodo',
    eventId: headers.id,
    customerEmail: d.customer?.email,
    productId: d.product_id,
    amount: d.total_amount,
    currency: d.currency,
    metadata: d.metadata || {},
  };
}

async function handleStripeWebhook(rawBody: string, signature: string): Promise<NormalizedPaymentEvent> {
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  const obj = event.data.object as Record<string, unknown>;
  const map: Record<string, NormalizedPaymentEvent['type']> = {
    'checkout.session.completed': 'payment.succeeded',
    'payment_intent.succeeded': 'payment.succeeded',
    'payment_intent.payment_failed': 'payment.failed',
    'charge.refunded': 'payment.refunded',
    'customer.subscription.created': 'subscription.created',
    'customer.subscription.updated': 'subscription.updated',
    'customer.subscription.deleted': 'subscription.cancelled',
  };
  return {
    type: map[event.type] || 'payment.succeeded',
    provider: 'stripe',
    eventId: event.id,
    customerEmail:
      (obj.customer_email as string) ||
      (obj.customer_details as Record<string, string> | undefined)?.email,
    productId: (obj.metadata as Record<string, string> | undefined)?.productId,
    amount: obj.amount_total as number | undefined,
    currency: obj.currency as string | undefined,
    metadata: (obj.metadata as Record<string, string>) || {},
  };
}

async function handleLemonSqueezyWebhook(
  rawBody: string,
  signature: string,
): Promise<NormalizedPaymentEvent> {
  // LS signs with HMAC-SHA256 hex of raw body using webhook secret (Web Crypto = Workers safe)
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(process.env.LEMONSQUEEZY_WEBHOOK_SECRET!),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hex !== signature) throw new Error('Invalid Lemon Squeezy webhook signature');

  const body = JSON.parse(rawBody) as {
    meta: { event_name: string; custom_data?: Record<string, string> };
    data: { id: string; attributes: Record<string, unknown> };
  };
  const attrs = body.data.attributes;
  const map: Record<string, NormalizedPaymentEvent['type']> = {
    order_created: 'payment.succeeded',
    order_refunded: 'payment.refunded',
    subscription_created: 'subscription.created',
    subscription_updated: 'subscription.updated',
    subscription_cancelled: 'subscription.cancelled',
    subscription_expired: 'subscription.cancelled',
  };
  return {
    type: map[body.meta.event_name] || 'payment.succeeded',
    provider: 'lemonsqueezy',
    eventId: body.data.id,
    customerEmail: (attrs.user_email as string) || undefined,
    productId: String(
      (attrs.first_order_item as Record<string, unknown> | undefined)?.variant_id || '',
    ),
    amount: attrs.total as number | undefined,
    currency: attrs.currency as string | undefined,
    metadata: body.meta.custom_data || {},
  };
}

// ============================================================
// CUSTOMER PORTAL (self-serve billing management)
// ============================================================

export async function createCustomerPortalUrl(customerId: string): Promise<string> {
  const provider = getProvider();
  if (provider === 'stripe') {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.SITE_URL || '/',
    });
    return session.url;
  }
  if (provider === 'lemonsqueezy') {
    const res = await fetch(`https://api.lemonsqueezy.com/v1/customers/${customerId}`, {
      headers: {
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY!}`,
        Accept: 'application/vnd.api+json',
      },
    });
    const json = (await res.json()) as {
      data: { attributes: { urls?: { customer_portal?: string } } };
    };
    return json.data.attributes.urls?.customer_portal || '';
  }
  // Dodo: hosted customer portal per customer
  return `${process.env.DODO_PORTAL_URL || 'https://app.dodopayments.com'}/customers/${customerId}`;
}

// ============================================================
// FULFILLMENT — money in, license out (idempotent)
// Product catalog is env-driven: DODO_PRODUCTS_JSON maps
// product_id -> { tier, kind }. Unknown product = throw,
// never grant access on anything unverified.
// Example:
//   {"pdt_starter":{"tier":"starter","kind":"full"},
//    "pdt_starter_pro":{"tier":"pro","kind":"upgrade","from":"starter"}}
// ============================================================

export type Tier = 'starter' | 'pro' | 'pro_plus';

const TIER_RANK: Record<Tier, number> = { starter: 0, pro: 1, pro_plus: 2 };

export const TIER_ENTITLEMENTS: Record<Tier, { seats: number; themeCount: number | null; updatesYears: number | null }> = {
  starter: { seats: 1, themeCount: 3, updatesYears: 1 },
  pro: { seats: 5, themeCount: 10, updatesYears: 1 },
  pro_plus: { seats: -1, themeCount: null, updatesYears: null }, // unlimited, all themes, lifetime
};

interface ProductMapping {
  tier: Tier;
  kind: 'full' | 'upgrade';
  from?: Tier;
}

function productCatalog(): Record<string, ProductMapping> {
  try {
    return JSON.parse(process.env.DODO_PRODUCTS_JSON || '{}');
  } catch {
    return {};
  }
}

export function resolveProduct(productId: string): ProductMapping {
  const mapping = productCatalog()[productId];
  if (!mapping || !(mapping.tier in TIER_RANK) || (mapping.kind !== 'full' && mapping.kind !== 'upgrade')) {
    throw new Error(`Unknown product_id "${productId}" — refusing to grant access`);
  }
  return mapping;
}

function makeLicenseKey(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return (
    'lic_' +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
}

interface DbClient {
  // Structural minimum of @libsql/client Client (rows read as records)
  execute(query: string | { sql: string; args?: unknown[] }): Promise<{ rows: unknown[]; lastInsertRowid?: unknown }>;
}

export interface Fulfillment {
  orderId: string;
  tier: Tier;
  upgraded: boolean;
  duplicate: boolean;
  licenseKey: string;
}

export async function fulfillPaymentSucceeded(
  event: NormalizedPaymentEvent,
  db: DbClient,
): Promise<Fulfillment> {
  if (!event.customerEmail) throw new Error('Missing customer email — refusing to grant access');

  // Idempotency: same event twice grants once
  const seen = await db.execute({
    sql: 'SELECT id FROM orders WHERE id = ?',
    args: [event.eventId],
  });
  if (seen.rows.length > 0) {
    const lic = await db.execute({
      sql: 'SELECT license_key, tier FROM licenses WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      args: [event.customerEmail],
    });
    const row = lic.rows[0] as { license_key: string; tier: Tier } | undefined;
    if (!row) throw new Error('Duplicate event with no license — refusing to grant access');
    return { orderId: event.eventId, tier: row.tier, upgraded: false, duplicate: true, licenseKey: row.license_key };
  }

  const mapping = resolveProduct(event.productId || '');
  const ent = TIER_ENTITLEMENTS[mapping.tier];

  // Upgrade products require owning the lower tier first
  if (mapping.kind === 'upgrade') {
    const owned = await db.execute({
      sql: 'SELECT tier FROM licenses WHERE email = ?',
      args: [event.customerEmail],
    });
    const ranks = owned.rows.map((r) => TIER_RANK[(r as { tier: Tier }).tier] ?? -1);
    const need = mapping.from ? TIER_RANK[mapping.from] : -1;
    if (!ranks.some((r) => r >= need && r < TIER_RANK[mapping.tier])) {
      throw new Error(`Upgrade requires owning ${mapping.from || 'a lower tier'} first`);
    }
  }

  const coupon = event.metadata?.coupon_code ? String(event.metadata.coupon_code) : null;
  // Checkout UI must send metadata.instant_delivery_waiver='true' with a checkbox:
  // "I agree to instant delivery and waive my right to withdraw." Stored per order.
  const waiver = event.metadata?.instant_delivery_waiver === 'true' ? 1 : 0;

  await db.execute({
    sql: `INSERT INTO orders (id, email, tier, product_id, amount, currency, status, coupon_code, cashback_forbidden, waiver)
          VALUES (?, ?, ?, ?, ?, ?, 'paid', ?, ?, ?)`,
    args: [
      event.eventId,
      event.customerEmail,
      mapping.tier,
      event.productId || '',
      event.amount || 0,
      event.currency || 'USD',
      coupon,
      coupon ? 1 : 0,
      waiver,
    ],
  });

  const existing = await db.execute({
    sql: 'SELECT id, tier, updates_until FROM licenses WHERE email = ? ORDER BY created_at DESC LIMIT 1',
    args: [event.customerEmail],
  });
  const prev = existing.rows[0] as { id: string; tier: Tier; updates_until: string } | undefined;

  let licenseKey: string;
  let upgraded = false;
  if (!prev) {
    licenseKey = makeLicenseKey();
    const until =
      ent.updatesYears === null
        ? 'lifetime'
        : new Date(Date.now() + ent.updatesYears * 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    await db.execute({
      sql: `INSERT INTO licenses (id, email, license_key, tier, seats, themes, updates_until)
            VALUES (?, ?, ?, ?, ?, '[]', ?)`,
      args: [`lic_${event.eventId}`, event.customerEmail, licenseKey, mapping.tier, ent.seats, until],
    });
  } else if (TIER_RANK[mapping.tier] > TIER_RANK[prev.tier]) {
    licenseKey = makeLicenseKey();
    upgraded = true;
    const until =
      ent.updatesYears === null
        ? 'lifetime'
        : new Date(Date.now() + ent.updatesYears * 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    await db.execute({
      sql: 'UPDATE licenses SET license_key = ?, tier = ?, seats = ?, updates_until = ? WHERE id = ?',
      args: [licenseKey, mapping.tier, ent.seats, until, prev.id],
    });
  } else {
    const same = await db.execute({
      sql: 'SELECT license_key FROM licenses WHERE id = ?',
      args: [prev.id],
    });
    licenseKey = String((same.rows[0] as { license_key: string }).license_key);
  }

  return { orderId: event.eventId, tier: mapping.tier, upgraded, duplicate: false, licenseKey };
}
