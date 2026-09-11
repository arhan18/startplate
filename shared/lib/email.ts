import type { Fulfillment, NormalizedPaymentEvent } from './payments';

// Single Resend path for server code (auth.ts keeps its own tested
// inline senders — don't churn it). Plain fetch to the Resend REST API:
// no SDK needed, works on edge + node, stubbed the same way in tests.

export function emailConfig() {
  return {
    key: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
  };
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const { key, from } = emailConfig();
  if (!key) return false; // dev without keys: skip silently
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
  });
  if (!res.ok) throw new Error(`Resend failed (${res.status})`);
  return true;
}

// Display names: tier keys (starter/pro/pro_plus) never reach buyers.
const TIER_NAMES: Record<string, string> = { starter: 'Solo', pro: 'Team', pro_plus: 'Agency' };

export function tierName(tier: string): string {
  return TIER_NAMES[tier] || tier;
}

// Pure HTML — unit-tested without network. Only states facts from the
// fulfillment result; never invents prices, discounts, or links.
export function receiptHtml(event: NormalizedPaymentEvent, r: Fulfillment): string {
  const amount =
    event.amount != null
      ? `${(event.amount / 100).toFixed(2)} ${(event.currency || 'USD').toUpperCase()}`
      : null;
  return [
    `<h1>Your license is ready</h1>`,
    `<p>Order <code>${event.eventId}</code> — tier <strong>${tierName(r.tier)}</strong>${r.upgraded ? ' (upgraded)' : ''}.</p>`,
    amount ? `<p>Charged: ${amount}.</p>` : '',
    `<p>License key:</p><pre>${r.licenseKey}</pre>`,
    `<p>Keep this key — it unlocks your purchase.</p>`,
  ].join('\n');
}

// Best-effort: email failure must never fail the webhook (money is
// already granted). Returns true if sent, false if skipped/failed.
export async function sendReceiptEmail(
  event: NormalizedPaymentEvent,
  r: Fulfillment,
): Promise<boolean> {
  try {
    if (!event.customerEmail || r.duplicate) return false;
    return await sendMail({
      to: event.customerEmail,
      subject: `Your ${tierName(r.tier)} license key`,
      html: receiptHtml(event, r),
    });
  } catch (e) {
    console.error('Receipt email failed:', (e as Error).message);
    return false;
  }
}
