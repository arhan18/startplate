import type { APIRoute } from 'astro';
import {
  handleWebhook,
  fulfillPaymentSucceeded,
  type NormalizedPaymentEvent,
  type PaymentProvider,
} from '../../lib/payments';
import { getDb } from '../../lib/db';
import { sendReceiptEmail } from '../../lib/email';

const provider = (process.env.PAYMENT_PROVIDER || 'dodo') as PaymentProvider;

/** Signature headers, per provider (Dodo needs all three — Standard Webhooks) */
function getHeaders(request: Request) {
  if (provider === 'stripe') {
    return { signature: request.headers.get('stripe-signature') || '' };
  }
  if (provider === 'lemonsqueezy') {
    return { signature: request.headers.get('x-signature') || '' };
  }
  return {
    signature: request.headers.get('webhook-signature') || '',
    id: request.headers.get('webhook-id') || undefined,
    timestamp: request.headers.get('webhook-timestamp') || undefined,
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // IMPORTANT: read raw text — signatures are computed over exact bytes
    const rawBody = await request.text();
    const headers = getHeaders(request);

    if (!headers.signature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const event = await handleWebhook(provider, rawBody, headers);

    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      case 'payment.refunded':
        console.log('Payment refunded:', event.eventId);
        break;
      case 'subscription.created':
        await handleSubscriptionCreated(event);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    // Signature failures land here — never grant access on error
    console.error('Webhook error:', error.message);
    return new Response(JSON.stringify({ error: 'Webhook verification failed' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function handlePaymentSucceeded(event: NormalizedPaymentEvent) {
  // Real fulfillment: idempotent order + license grant. Throws on
  // unknown products or missing email — never grant on error.
  const result = await fulfillPaymentSucceeded(event, getDb());
  console.log('Payment fulfilled:', result.orderId, result.tier, result.upgraded ? '(upgrade)' : '', result.duplicate ? '(duplicate)' : '');
  await sendReceiptEmail(event, result); // best-effort, never throws
}

async function handlePaymentFailed(event: NormalizedPaymentEvent) {
  console.log('Payment failed:', event.eventId);
  // TODO: Update database, send failure notification
}

async function handleSubscriptionCreated(event: NormalizedPaymentEvent) {
  console.log('Subscription created:', event.eventId);
  // TODO: Create subscription record in database
}

async function handleSubscriptionUpdated(event: NormalizedPaymentEvent) {
  console.log('Subscription updated:', event.eventId);
  // TODO: Update subscription status in database
}

async function handleSubscriptionCancelled(event: NormalizedPaymentEvent) {
  console.log('Subscription cancelled:', event.eventId);
  // TODO: Update subscription status, revoke access
}
